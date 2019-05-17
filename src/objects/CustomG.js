import {
  Object3D,
  DoubleSide,
  Face3,
  Geometry,
  Math as tMath,
  MeshStandardMaterial,
  Mesh,
  Vector3,
} from 'three'

export default class CustomG extends Object3D {
  constructor() {
    super()

    const geometry = new Geometry()
    const dist = 10

    for (let i = 0; i < 360; i++) {
      const x1 = Math.sin(tMath.radToDeg(i)) * dist
      const x2 = Math.sin(tMath.radToDeg(i)) * dist
      const x3 = Math.sin(tMath.radToDeg(i)) * dist

      const y1 = Math.cos(tMath.radToDeg(i)) * dist
      const y2 = Math.cos(tMath.radToDeg(i)) * dist
      const y3 = Math.cos(tMath.radToDeg(i)) * dist

      const z1 = Math.cos(tMath.radToDeg(i)) * dist
      const z2 = Math.cos(tMath.radToDeg(i)) * dist
      const z3 = Math.sin(tMath.radToDeg(i)) * dist

      for (let j = 0; j < 7; ++j) {
        const v1 = new Vector3(x1 * j, y2 * j, z3 * (3 * j) * Math.PI)
        const v2 = new Vector3(x3 * j, y1 * j, z2 * (3 * j) * Math.TWO_PI)
        const v3 = new Vector3(x2 * j, y3 * j, z2 * (3 * j) * Math.TWO_PI)

        geometry.vertices.push(v1)
        geometry.vertices.push(v2)
        geometry.vertices.push(v3)

        geometry.faces.push(new Face3(i, i + 1, i + 2))
      }
    }

    geometry.computeFaceNormals()
    geometry.computeVertexNormals()

    const material = new MeshStandardMaterial({
      roughness: 0.18,
      metalness: 0.6,
      side: DoubleSide,
    })

    const mesh = new Mesh(geometry, material)

    this.add(mesh)
  }
}
