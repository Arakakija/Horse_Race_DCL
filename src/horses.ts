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

function createHorse(id : number) : Entity{
    const horseEntity = engine.addEntity();
    MeshRenderer.setSphere(horseEntity)
    SetHorseTransform(horseEntity,id);
    utils.triggers.oneTimeTrigger(horseEntity,
        utils.LAYER_1,
        utils.LAYER_2,
        [{type: 'box'}],
        ()=>{ResetHorse(horseEntity)});
    Horse.create(horseEntity,{id: id, startPosition: Transform.get(horseEntity).position});
    SetColor(horseEntity)
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

function SetHorseTransform(horseEntity : Entity,id : number)
{
  Transform.create(horseEntity,{
    position:{
      x: Transform.get(GetTile(0,id * 2)).position.x,
      y: 1,
      z: Transform.get(GetTile(0,id * 2)).position.z
    }
  })
}

export function AddHorse(horses : Entity[]) {
    const horse = createHorse(horses.length)
    horses.push(horse)
  }