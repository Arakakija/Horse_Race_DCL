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

function createHorse(horseId : number,positionX : number,positionY : number) : Entity{
    const horseEntity = engine.addEntity();
    console.log("creando entity");
    Horse.create(horseEntity,{
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
  
export function AddHorse(horseId: number,positionX : number, positionY : number) {
    const horse = createHorse(horseId,positionX,positionY)
    return horse;
}


export function MoveHorse(horseId : number,horse : Entity,room : Room) {
    const horsePosition = Transform.getMutable(horse);
    const horseEntity = Horse.getMutable(horse);

    const grid = Array.from(room.state.grid.values());
    console.log("grid length: " + grid.length);
    
    let point : any;
    let i = 0; 
    grid.forEach((ring : any) =>
    {
            if(i === horseId)
            {
                point = ring.points[horseEntity.actualPosition + 1]
                i++;
                return;
            } 
            else{
                i++;
            }
    })


    horsePosition.position.x = point.x;
    horsePosition.position.z = point.y;
    room.send("move-horse", horseId)
    
}