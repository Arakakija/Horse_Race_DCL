import {
    Entity,
    engine,
    MeshRenderer,
    Transform,
  } from '@dcl/sdk/ecs'
import { ResetHorse } from './systems';
import * as utils from '@dcl-sdk/utils'
import { Horse } from './custom-components';
import { Room } from 'colyseus.js';
import { Vector3 } from '@dcl/sdk/math';

function createHorse(horseId : number,positionX : number, positionY: number) : Entity{
    const horseEntity = engine.addEntity();
    console.log("creando entity");
    const horse = Horse.create(horseEntity,{
        id : horseId,
        actualPosition: 0
    })
    MeshRenderer.setSphere(horseEntity)
    Transform.create(horseEntity,{position:{x : positionX, y : 1, z : positionY}})
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


export function MoveHorse(horse : Entity, endPosition : Vector3) {
    const horsePosition = Transform.getMutable(horse);

    utils.tweens.startTranslation(horse,horsePosition.position,endPosition,1.0);
}

export function BackHorse(horseId : number,horse : Entity,room : Room) {
    const horsePosition = Transform.getMutable(horse);
    const horseComponent = Horse.getMutable(horse);


    const grid = Array.from(room.state.grid.values());
    let point : any;
    let i = 0; 
    grid.forEach((ring : any) =>
    {
            if(i === horseId)
            {
                if(horseComponent.actualPosition > 0)
                {
                    point = ring.points[horseComponent.actualPosition - 1]
                    horseComponent.actualPosition--;
                    i++;
                }
                else{
                    point = ring.points[0]
                    horseComponent.actualPosition = 0;
                }
                return;
            } 
            else{
                i++;
            }
    })
    horsePosition.position.x = point.x;
    horsePosition.position.z = point.y;
}