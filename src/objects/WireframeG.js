import {
  BufferGeometry,
  Color,
  Object3D,
  Math as tMath,
  SphereGeometry,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
} from 'three'

import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

var spheres = []
var color = new Color(0, 0, 0)

class WireframeG extends Object3D {
  constructor(totalSize, sphereSize) {
    super()

    // our futur array of bufferGeometry
    const spheres = []

    const geo = new BufferGeometry().fromGeometry(new SphereGeometry(sphereSize, 5, 5))

    for (var i = 0; i < totalSize; i++) {
      // instead of creating a new geometry, we just clone the bufferGeometry instance
      const geometry = geo.clone()
      geometry.applyMatrix(
        new Matrix4().makeTranslation(Math.random() * 1000 - 500, Math.random() * 1000 - 500, 0)
      )
      geometry.rotateX(Math.random() * 1)
      geometry.rotateY(Math.random() * 1)
      // then, we push this bufferGeometry instance in our array
      spheres.push(geometry)
    }

    const geometriesSpheres = BufferGeometryUtils.mergeBufferGeometries(spheres)

    const sphereMaterial = new MeshBasicMaterial({
      wireframeLinewidth: 1,
      wireframe: true,
      transparent: true,
      opacity: 0.075,
    })

    this.mesh = new Mesh(geometriesSpheres, sphereMaterial)
    this.add(this.mesh)
  }

  updateColor(lowAvg, midAvg) {
    const r = tMath.mapLinear(lowAvg, 0, 1, 20, 125)
    const g = tMath.mapLinear(midAvg, 0, 1, 125, 255)
    const b = 0

    color.r = r
    color.g = g
    color.b = b
    this.mesh.material.color.set(color)
  }
}

export default WireframeG
