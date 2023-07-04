import {
    engine,
    MeshRenderer,
    Transform
  } from '@dcl/sdk/ecs'

  import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
  import { Tile } from './custom-components'

    const sizeX = 1
    const sizeY = 1
    const offset = 0.5

  export function createGrid(nodesX: number[], nodesY : number[])
  {
    for (let i = 0; i < nodesX.length; i++) {
        for (let j = 0; j < nodesY.length; j += 2) {
          const tileEntity = engine.addEntity()
          MeshRenderer.setPlane(tileEntity)
          Transform.create(tileEntity, {
            position: Vector3.create(i * sizeX + offset, 0, j * sizeY + offset),
            rotation: Quaternion.fromEulerDegrees(90, 0, 0),
            scale: Vector3.create(1, 1, 1)
          })
          Tile.create(tileEntity, { id: { idX: i, idY: j } })
        }
      }
  }