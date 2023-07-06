import {
    Entity,
    engine,
    MeshRenderer,
    Material,
    Transform,
  } from '@dcl/sdk/ecs'
import { Horse } from './custom-components';
import { GetTile } from './grid-systems';
import { ResetHorse } from './systems';
import * as utils from '@dcl-sdk/utils'

function createHorse(positionX : number,positionY : number) : Entity{
    const horseEntity = engine.addEntity();
    console.log("creando entity");
    MeshRenderer.setSphere(horseEntity)
    Transform.create(horseEntity,{position:{x : positionX, y : positionY, z : 0}})
    utils.triggers.oneTimeTrigger(horseEntity,
        utils.LAYER_1,
        utils.LAYER_2,
        [{type: 'box'}],
        ()=>{ResetHorse(horseEntity)}); 
    return horseEntity;
  }
  

function SetColor(entity: Entity){
    const horse = Horse.getMutable(entity);
    switch(horse.id){
      case 0:
        Material.setPbrMaterial(entity,{
          albedoColor: {a:1,r:1,g:0,b:0}
        })
        break;
      case 1:
        Material.setPbrMaterial(entity,{
          albedoColor: {a:1,r:0,g:0,b:1}
        })
        break;
      case 2:
        Material.setPbrMaterial(entity,{
          albedoColor: {a:1,r:0,g:1,b:0}
        })
        break;
      case 3:
        Material.setPbrMaterial(entity,{
          albedoColor: {a:1,r:1,g:0,b:1}
        })
        break;
    }
  }

export function AddHorse(positionX : number, positionY : number) {
    const horse = createHorse(positionX,positionY)
    return horse;
  }