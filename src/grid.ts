import {
    engine,
    Entity,
    MeshRenderer,
    Schemas,
    Transform
  } from '@dcl/sdk/ecs'

  import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { Grid } from './custom-components';


  export function createCircularGrid(center: Vector3, radius: number, rings: number, segments: number) {
    const gridEntity = engine.addEntity();
    const grid = Grid.create(gridEntity);

    const anglePerSegment = 360 / segments;
    const distanceBetweenRings = radius / rings;
  
    for (let ring = 0; ring < rings; ring++) {
      const currentRadius = distanceBetweenRings * (ring + 1);
      const ringMap = Schemas.Map({
        id: Schemas.Int,
        points: Schemas.Array(Schemas.Vector3),
      }).create();
      
      for (let segment = 0; segment < segments; segment++) {
        const angle = (segment * anglePerSegment * Math.PI) / 180; // Convert degrees to radians
        const newX = center.x + currentRadius * Math.cos(angle);
        const newZ = center.z + currentRadius * Math.sin(angle);
        const newVector = Vector3.create(newX, 1, newZ);
        ringMap.points.push(newVector);
      }
      grid.ring.push(ringMap);
    }

    return gridEntity;
  }

  export function GenerateGridGraph(gridEntity : Entity)
  {
      const grid = Grid.get(gridEntity);
      grid.ring.forEach((ring) => {
        ring.points.forEach((point) => 
        {
          const pointsPreview = engine.addEntity();
          MeshRenderer.setSphere(pointsPreview);
          Transform.create(pointsPreview,
              {
                  position : {
                      x : point.x,
                      y : 1,
                      z : point.z, 
                  }
              })
        })
      })
  }


