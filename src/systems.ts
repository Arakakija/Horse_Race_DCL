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
import { Grid, Horse, Roulette } from './custom-components';
 import { getRandomNumber } from './Utils';
import { MoveHorse, RestartHorse, checkIfHorsesMustGoBack } from './horses';
import { ActivateRoulette, DeactivateRoulette, GetAngle, Win, grid, horses, playerBet, playerCash, playerHorseId, shouldRotate, winPosition } from './gameplay';
import { Quaternion, Vector3 } from '@dcl/sdk/math';
import { getWorldRotation } from '@dcl-sdk/utils';
  
  
   export let startGame : boolean =false;
  let ResetGame : boolean = false
  let interval = 5;
  export let cooldown = 0;
  export let duration = 0;
  
  
  let minPosition : number = 1;
  let waitForReset = 5


  export function Update(dt: number)
  {
        if(!startGame) return
        if(cooldown <= 0)
        {
           cooldown = ActivateRoulette() + 4.0 
        }
        cooldown -= dt;
  }

export function MoveHorseByRoullete(horseId: number) {
   const horse = horses[horseId];
   const horseComp = Horse.getMutable(horse);
   const CheckIfWinPosition = horseComp.actualPosition < winPosition ? Horse.get(horse).actualPosition + 1 : 0;
   const point = Grid.get(grid).ring[horseId].points[CheckIfWinPosition];
   MoveHorse(horse, point.position, Grid.get(grid).ring[horseId].points[CheckIfWinPosition].rotation);
   horseComp.actualPosition++;

   if(horseComp.actualPosition > winPosition)
   {
       ResetGame =true;
       startGame = false;
       if(horseComp.id === playerHorseId) Win();

   } 
   if(checkIfHorsesMustGoBack(minPosition)) minPosition++;
}

   export function SetDuration(amount : number)
   {
      duration = amount;
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

  export function StartGame()
  {
    startGame = true
  }



  export function SpinRoullete(dt : number)
  {
   if(!shouldRotate) return;
   const roulette = engine.getEntityOrNullByName("Roulette.glb");
   if(roulette)
   {
      
      if(duration > 0)
      {
         const transform = Transform.getMutable(roulette);
         transform.rotation = Quaternion.multiply(transform.rotation, Quaternion.fromAngleAxis(duration * dt * 40 , Vector3.Left()))
         duration-= dt;
         if(duration <0) {
            duration = 0;
            GetAngle(transform.rotation);
            DeactivateRoulette()
         }
      }
   }
}
  
 