import {
    engine,
    MeshRenderer,
    Transform,
    PointerEvents,
    InputAction,
    PointerEventType,
    Schemas,
    inputSystem,
    Entity
  } from '@dcl/sdk/ecs'
  import { Horse } from './custom-components';
  import { GetTile } from './grid-systems';
 import { getRandomNumber } from './Utils';
  
  
  let interval = 3;
  let cooldown = 0;
  
  let minPosition = 1;


  export function MoveHorseForward(horseEntity : Entity, nodesX : number[], nodesY : number[])
  {
     const horseTransfrom = Transform.getMutable(horseEntity);
     const horse = Horse.getMutable(horseEntity);
     if(horse.actualPosition < nodesX.length - 1)
     {
        horseTransfrom.position.x = Transform.get(GetTile(horse.actualPosition+1,0)).position.x;
        horse.actualPosition++;
     }    
  }

  export function MoveHorseBackward(horseEntity : Entity)
  {
     const horseTransfrom = Transform.getMutable(horseEntity);
     const horse = Horse.getMutable(horseEntity);
     if(horse.actualPosition > 0)
     {
        horseTransfrom.position.x = Transform.get(GetTile(horse.actualPosition-1,0)).position.x;
        horse.actualPosition--;
     }    
  }  
  
  export function Update(nodesX : number[], nodesY : number[],dt: number)
  {

        if(cooldown <= 0)
        {
           MoveRandomHorseForward(GetHorse(getRandomNumber(0,3)),nodesX,nodesY);
           cooldown = interval;
        }
        cooldown -= dt;
  }
  
  
  export function MoveRandomHorseForward(horseEntity : Entity, nodesX : number[], nodesY : number[])
  {
     MoveHorseForward(horseEntity,nodesX,nodesY);
     CheckForPositions(nodesX,nodesY);
  }
  
  export function MoveRandomHorseBackward(horseEntity : Entity, nodesX : number[], nodesY : number[])
  {
     MoveHorseBackward(horseEntity);
  }
  
  export function ResetHorse(horseEntity : Entity)
  {
     let horseTransfrom  = Transform.getMutable(horseEntity).position;
     horseTransfrom = Horse.get(horseEntity).startPosition;
  }
  
  function GetHorse(id : number) : Entity
  {
     for(const [horseEntity] of engine.getEntitiesWith(Horse))
     {
        if(Horse.get(horseEntity).id === id)
        {
           return horseEntity;
        }
     }
     const horseEntity = engine.addEntity()
     console.log('No horses found');
     return horseEntity;
  }
  
  function CheckForPositions(nodesX : number[], nodesY : number[])
  {
     let i = 0;
     for(const [horseEntity] of engine.getEntitiesWith(Horse))
     {
        if(Horse.get(horseEntity).actualPosition >= minPosition)
        {
           i++;
  
        }
     }
  
     if(i >= 4)
     {
        console.log('Entro');
        MoveRandomHorseBackward(GetHorse(getRandomNumber(0,3)),nodesX,nodesY);
        i = 0;
        minPosition++;
     }
  }

 