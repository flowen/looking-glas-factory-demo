import {
  Object3D,
  DoubleSide,
  Face3,
  Geometry,
  Math as tMath,
  MeshStandardMaterial,
  Mesh,
  Vector3,
  Color,
} from 'three'

export default class CustomG extends Object3D {
  constructor() {
    super()

    const geometry = new Geometry()

    const length = 10
    const color = new Color(0xffaa00)

    const totalBlades = 10

    for (let j = 0; j < totalBlades + 1; j++) {
      for (let i = 0; i < 7; i++) {
        const v1 = new Vector3(0, i * length, Math.PI * j + 25)
        const v2 = new Vector3(length * 3 * i, i * length + 0.5 * length, Math.PI * j + 25)
        const v3 = new Vector3(0, i * length + length, Math.PI * j * 25)

        geometry.vertices.push(v1, v2, v3)

        const face = new Face3(
          i * 3 + j * 3,
          i * 3 + 1 + (j * 3 + 1),
          i * 3 + 2 + (j * 3 + 2),
          null,
          color
        )

        geometry.faces.push(face)
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
