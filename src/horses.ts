import {
    Entity,
    engine,
    Transform,
    GltfContainer,
  } from '@dcl/sdk/ecs'
import { ResetHorse } from './systems';
import * as utils from '@dcl-sdk/utils'
import { Horse } from './custom-components';
import { Quaternion, Vector3 } from '@dcl/sdk/math';

function createHorse(horseId : number,positionX : number, positionY: number) : Entity{
    const horseEntity = engine.addEntity();
    console.log("creando entity");
    Horse.create(horseEntity,{
        id : horseId,
        actualPosition: 0,
        startPosition: Vector3.create(positionX, 1, positionY),
    })
    
    const sourceFilePath = 'assets/scene/seahorse-'+ (horseId) +'.glb'
    GltfContainer.create(horseEntity,{
        src: sourceFilePath
    })

    Transform.create(horseEntity,{
        position: Horse.get(horseEntity).startPosition,
    })
    utils.triggers.oneTimeTrigger(horseEntity,
        utils.LAYER_1,
        utils.LAYER_2,
        [{type: 'box'}],
        ()=>{ResetHorse(horseEntity)}); 
    return horseEntity;
}
  
export function AddHorse(horseId: number, positionX : number, positionY: number) {
    const horse = createHorse(horseId,positionX,positionY)
    return horse;
}

export function RestartHorses(horse : Entity)
{
    const horseEntity =  Horse.getMutable(horse);
    const horseTransform = Transform.getMutable(horse);
    horseEntity.actualPosition = 0;
    horseTransform.position = horseEntity.startPosition;
    horseTransform.rotation = Quaternion.Zero();

}


export function MoveHorse(horse : Entity, endPosition : Vector3, rotation : number) {
    const horseTransform = Transform.getMutable(horse);

    utils.tweens.startTranslation(horse,horseTransform.position,endPosition,1.0);
    utils.tweens.startRotation(horse,horseTransform.rotation, Quaternion.fromEulerDegrees(0, -rotation * (180 / Math.PI), 0),1.10)

}