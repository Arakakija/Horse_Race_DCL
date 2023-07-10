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
import { Grid, Horse } from './custom-components';
 import { getRandomNumber } from './Utils';
import { MoveHorse, RestartHorse, checkIfHorsesMustGoBack } from './horses';
import { grid, horses, winPosition } from './gameplay';
  
  
  let startGame : boolean = true
  let ResetGame : boolean = false
  let interval = 5;
  let cooldown = 5;
  
  let minPosition : number = 1;
  let waitForReset = 5


  export function Update(dt: number)
  {
        if(!startGame) return
        if(cooldown <= 0)
        {
           const horseId = getRandomNumber(0,3)
           const horse = horses[horseId];
           const horseComp = Horse.getMutable(horse);
           const CheckIfWinPosition = horseComp.actualPosition < winPosition ? Horse.get(horse).actualPosition + 1 : 0;
           const point = Grid.get(grid).ring[horseId].points[CheckIfWinPosition]
           MoveHorse(horse,point.position,Grid.get(grid).ring[horseId].points[CheckIfWinPosition].rotation)
           horseComp.actualPosition++;
           if(horseComp.actualPosition > winPosition)
           {
               ResetGame =true;
               startGame = false;

           } 
           if(checkIfHorsesMustGoBack(minPosition)) minPosition++;
           cooldown = interval; 
        }
        cooldown -= dt;
  }
  

  export function resetHorses(dt : number)
  {
      if(!ResetGame) return
      if(waitForReset <= 0)
      {
         horses.forEach((horse)=> {
            RestartHorse(horse);
         })
         waitForReset = 5;
         ResetGame = false;
      }
      else
      {
         waitForReset-= dt;
      }
  }

  export function ResetHorse(horseEntity : Entity)
  {
     let horseTransfrom  = Transform.getMutable(horseEntity).position;
     horseTransfrom = Horse.get(horseEntity).startPosition;
  }
  
