import './scss/index.scss'

import HoloPlay from './lib/holoplay'

import { Math as tMath, PerspectiveCamera, PointLight, Scene, WebGLRenderer } from 'three'
import { EffectComposer } from 'postprocessing'

import { audio, listener } from './objects/Audio'
import { audioUtil, analyser, bands } from './utils/analyser'
import average from 'analyser-frequency-average'

import { preloader } from './loader'
import { AudioResolver } from './loader/resolvers/AudioResolver'

import CustomG from './objects/CustomG'
import WireframeG from './objects/WireframeG'
import OrbitControls from './controls/OrbitControls'
import PPmanager from './controls/PostprocessingManager'

/* Custom settings */
const SETTINGS = {
  useComposer: true,
  tsmooth: 0.75,
  focalDistance: 35,
}

let time = 0
let tprev = 0
let stats

/* Init renderer and canvas */
const container = document.getElementsByTagName('main')[0]
const renderer = new WebGLRenderer()
container.style.overflow = 'hidden'
container.style.margin = 0

container.appendChild(renderer.domElement)
renderer.setClearColor(0x120707)

let composer = new EffectComposer(renderer)

/* Main scene and camera */
const scene = new Scene()
const camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 100

const holoplay = new HoloPlay(scene, camera, renderer)

/* controls */
const controls = new OrbitControls(camera, {
  element: container,
  distance: 200,
  phi: Math.PI * 0.5,
  distanceBounds: [0, 300],
})
controls.enableDamping = true
controls.dampingFactor = 0.15

/* Lights */
const frontLight = new PointLight(0xffcc66, 1)
frontLight.position.x = 20
frontLight.position.y = 12
frontLight.position.z = 70

const backLight = new PointLight(0xff66e4, 0.5)
backLight.position.x = -20
backLight.position.z = 65

scene.add(frontLight, backLight)

/* Actual content of the scene */
const customG = new CustomG(7)
scene.add(customG)

const wireframeG = new WireframeG(200, 40)
scene.add(wireframeG)

/* Audio */
camera.add(listener)

/* Various event listeners */
window.addEventListener('resize', onResize)

/* Preloader */
preloader.init(new AudioResolver())
preloader
  .load([
    {
      id: 'soundTrack',
      type: 'audio',
      url: require('./assets/audio/mert.mp3'),
    },
  ])
  .then(() => {
    PPmanager.init()
    onResize()

    const audioBuffer = preloader.get('soundTrack')
    audio.setBuffer(audioBuffer)
    audio.setLoop(false)
    audio.setVolume(1)

    const playButton = document.querySelector('.play')
    const screenStart = document.querySelector('.screen--start')

    const start = () => {
      audio.play()
      animate()

      screenStart.classList.add('hidden')
      playButton.removeEventListener('click', start)
    }

    playButton.addEventListener('click', start)
  })

/* setup GUI and Stats monitor */
if (DEVELOPMENT) {
  const dat = require('dat.gui')
  const gui = new dat.GUI({ name: 'GUI' })

  gui.add(SETTINGS, 'useComposer')

  const Stats = require('stats.js')
  stats = new Stats()
  stats.showPanel(0)
  container.appendChild(stats.domElement)

  stats.domElement.style.position = 'absolute'
  stats.domElement.style.top = 0
  stats.domElement.style.left = 0
}

/**
  Resize canvas
*/
function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  composer.setSize(window.innerWidth, window.innerHeight)
}

/**
  RAF
*/
function animate() {
  requestAnimationFrame(animate)
  render()
}

/**
  Render loop
*/
function render() {
  if (DEVELOPMENT) stats.begin()

  holoplay.render()

  const freqs = audioUtil.frequencies()

  // update average of bands
  const lowAvg = average(analyser, freqs, bands.low.from, bands.low.to)
  const midAvg = average(analyser, freqs, bands.mid.from, bands.mid.to)
  const highAvg = average(analyser, freqs, bands.high.from, bands.high.to)
  controls.update()

  tprev = time * 0.75
  time = 0.0025 + lowAvg + tprev

  frontLight.intensity = lowAvg * 2.5
  backLight.intensity = highAvg * 3.5

  customG.rotation.x = Math.sin(Math.PI * 10) + time
  customG.rotation.y = Math.cos(Math.PI * 7.5) + time
  customG.rotation.z += 0.005

  wireframeG.rotation.x = Math.sin(Math.PI * 0.5) + time / 10
  wireframeG.rotation.y = Math.cos(Math.PI * 0.5) + time / 10
  wireframeG.rotation.z -= 0.0025

  wireframeG.updateColor(lowAvg, midAvg, highAvg)

  /* camera */
  camera.lookAt(customG.position)
  // camera.setFocalLength(SETTINGS.focalDistance)
  camera.setFocalLength(tMath.mapLinear(lowAvg, 0, 1, 20, 30))

  PPmanager.blurControls(
    tMath.mapLinear(highAvg, 0, 1, 0.7, 0.9),
    tMath.mapLinear(highAvg, 0, 1, 0.5, 0.7)
  )
  PPmanager.bloomControls(tMath.mapLinear(lowAvg, 0, 1, 0.0001, 1))

  if (SETTINGS.useComposer) {
    composer.render()
  } else {
    renderer.clear()
    renderer.render(scene, camera)
  }

  if (DEVELOPMENT) stats.end()
}

export { SETTINGS, scene, composer, camera, listener }
