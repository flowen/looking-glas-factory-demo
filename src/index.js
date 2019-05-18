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
const customG = new CustomG()
customG.rotation.x = 30
customG.rotation.y = 45
customG.rotation.z = 90
scene.add(customG)

const wireframeG = new WireframeG(200, 40)
scene.add(wireframeG)

/* Audio */
camera.add(listener)

/* Resize canvas */
function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  composer.setSize(window.innerWidth, window.innerHeight)
}
window.addEventListener('resize', onResize)

/* start Preloader */
const screenStart = document.querySelector('.screen--start')
const screenEnd = document.querySelector('.screen--end')
const playButton = document.querySelector('.js--play')
playButton.addEventListener('click', start)

preloader.init(new AudioResolver(screenStart))
preloader
  .load([
    {
      id: 'soundTrack',
      type: 'audio',
      url: require('./assets/audio/lowkolos - receive.mp3'),
    },
  ])
  .then(() => {
    PPmanager.init()
    onResize()

    const audioBuffer = preloader.get('soundTrack')
    audio.setBuffer(audioBuffer)
    audio.setLoop(false)
    audio.setVolume(0.5)
    // audio.play()
    // audio.offset = 213 // for testing purposes, starts at end of the track
  })

function start() {
  console.log('start')
  if (!screenStart.classList.contains('hidden')) screenStart.classList.add('hidden')
  if (!screenEnd.classList.contains('hidden')) screenEnd.classList.add('hidden')
  console.log(audio)

  audio.play()
  loop()
}

function end() {
  console.log('end')
  screenEnd.classList.remove('hidden')
}

/**
  RAF
*/

function loop() {
  audio.isPlaying ? (requestAnimationFrame(loop), render()) : end()
}

/**
  Render loop
*/

let time = 0
let tprev = 0
let intensity = 1

function render() {
  const freqs = audioUtil.frequencies()

  // update average of bands
  const subAvg = average(analyser, freqs, bands.sub.from, bands.sub.to)
  const lowAvg = average(analyser, freqs, bands.low.from, bands.low.to)
  const midAvg = average(analyser, freqs, bands.mid.from, bands.mid.to)
  const highAvg = average(analyser, freqs, bands.high.from, bands.high.to)

  // console.log(midAvg.toFixed(2), highAvg.toFixed(2), parseFloat(midAvg + highAvg).toFixed(2))

  tprev = time * 0.75
  time = 0.0025 + lowAvg + tprev

  const midhighs = midAvg + highAvg
  midhighs > 1.25 ? (intensity = tMath.mapLinear(midhighs, 0, 1.5, 1, 20)) : (intensity = 1)

  frontLight.intensity = lowAvg * 2.5 * intensity
  backLight.intensity = highAvg * 3.5 * intensity

  const xRotation = Math.sin(Math.PI * 10) + time
  const yRotation = Math.cos(Math.PI * 7.5) + time

  customG.rotation.x = xRotation
  if (subAvg > 0.85) customG.rotation.x += subAvg

  customG.rotation.y = yRotation
  customG.rotation.z += 0.005

  wireframeG.rotation.x = Math.sin(Math.PI * 0.5) + time / 10
  wireframeG.rotation.y = Math.cos(Math.PI * 0.5) + time / 10
  wireframeG.rotation.z -= 0.0025

  wireframeG.updateColor(lowAvg, midAvg, highAvg)

  /* camera */
  camera.lookAt(customG.position)
  camera.setFocalLength(tMath.mapLinear(lowAvg, 0, 1, 20, 30))

  PPmanager.blurControls(
    tMath.mapLinear(highAvg, 0, 1, 0.7, 0.9),
    tMath.mapLinear(highAvg, 0, 1, 0.5, 0.7)
  )
  PPmanager.bloomControls(tMath.mapLinear(lowAvg, 0, 1, 0.0001, 1), intensity)
  PPmanager.scanlineControls(tMath.mapLinear(lowAvg, 0, 1, 0.1, 5), intensity)

  controls.update()

  composer.render()
  holoplay.render()
}

export { SETTINGS, scene, composer, camera, listener }
