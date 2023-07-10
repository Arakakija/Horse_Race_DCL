import {
    Entity,
    engine,
    Transform,
    GltfContainer,
  } from '@dcl/sdk/ecs'
import { ResetHorse } from './systems';
import * as utils from '@dcl-sdk/utils'
import { Grid, Horse } from './custom-components';
import { Quaternion, Vector3 } from '@dcl/sdk/math';
import { grid, horses } from './gameplay';
import { getRandomNumber } from './Utils';

export function createHorse(horseId : number,startPosition : Vector3) : Entity{
    const horseEntity = engine.addEntity();
    Horse.create(horseEntity,{
        id : horseId,
        actualPosition: 0,
        startPosition: Vector3.create(startPosition.x, 1.25, startPosition.z),
    })
    
    const sourceFilePath = 'assets/scene/seahorse-'+ (horseId + 1) +'.glb'
    GltfContainer.create(horseEntity,{
        src: sourceFilePath
    })

    Transform.create(horseEntity,{
        position: Horse.get(horseEntity).startPosition,
        rotation: Quaternion.fromEulerDegrees(0,180,0),
        scale: Vector3.create(0.65,0.65,0.65)
    })

    return horseEntity;
}
  
export function RestartHorse(horse : Entity)
{
    const horseEntity =  Horse.getMutable(horse);
    const horseTransform = Transform.getMutable(horse);
    horseEntity.actualPosition = 0;
    horseTransform.position = horseEntity.startPosition;
    horseTransform.rotation = Quaternion.fromEulerDegrees(0,180,0);

}


export function MoveHorse(horseEntity : Entity, endPosition : Vector3, rotation : Quaternion) {
    const horseTransform = Transform.getMutable(horseEntity);
    const horse = Horse.getMutable(horseEntity);
    utils.tweens.startTranslation(horseEntity,horseTransform.position,endPosition,1.0);
    utils.tweens.startRotation(horseEntity,horseTransform.rotation, rotation,1.10)
}

export function checkIfHorsesMustGoBack(minPosition : number) :Boolean {
    let counter = 0;
    horses.forEach((horse)=>{
      if(Horse.get(horse).actualPosition >= minPosition){ 
        counter++ 
    }
    })
    if(counter>=4){
        const horseId = getRandomNumber(0,3)
        const horse = horses[horseId];
        if(Horse.get(horse).actualPosition-1 <= 0) return false;
        const point = Grid.get(grid).ring[horseId].points[Horse.get(horse).actualPosition-1]
       
      MoveHorse(horse,point.position,Grid.get(grid).ring[horseId].points[Horse.get(horse).actualPosition-1].rotation)
      Horse.getMutable(horse).actualPosition--
      return true
    }
    return false

}