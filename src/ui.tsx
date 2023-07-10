import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { Button, Dropdown, Label, ReactEcsRenderer, UiEntity } from '@dcl/sdk/react-ecs'
import { gameStatus, playerCash, timeToWait } from './gameplay'
import { Color4Type, Font } from '@dcl/sdk/ecs'

export let betHorse : string = '1';
let placeBet : any;


export function setFunction(test : any)
{
    placeBet = test;
}

function selectOption(index: number) {
    switch(index){
      case 0:
        betHorse = '1'
        break
      case 1:
        betHorse = '2'
      case 2:
        betHorse = '3'
        break
    case 3:
        betHorse = '4'
        break
    }
  }
  
const uiComponent = () => (
  <UiEntity
    uiBackground={{ color: Color4.Clear() }}
  >
    <UiEntity
        uiTransform={{
            width: 400,
            height: 100,
            margin: { top: '100px', left : '300px'}
        }}
        uiBackground={{ color: Color4.create(0, 0, 0, 0.6) }}
        uiText={{ value: gameStatus + timeToWait , fontSize: 30 }}
    />
    <UiEntity uiText={{value : "Select a Horse", fontSize : 18, color : Color4.Green()}}
        uiTransform={{
          width: "140px",
          height: "40px",
          margin: { bottom: '600px', right : '50px'}
        }}
      />
      <Dropdown
        options= {[`Yellow`, `Purple`, `Green`,' Pink']}
        fontSize={8}
        onChange={selectOption}
        uiTransform={{
          width: "200px",
          height: "40px",
          margin: { bottom: '600px'}
        }}
        uiBackground={{color: Color4.Gray()}}
      />


    <Button
			value="BET"
			uiTransform={{ width: 80, height: 20,  margin: { bottom: '600px', left : '30px' }}}
			onMouseDown={placeBet}
      
		/>
    <UiEntity uiText={{value : "CASH: " + playerCash, fontSize : 10, color : Color4.Green()}}
        uiTransform={{
          width: "140px",
          height: "40px",
          margin: { bottom: '400px', right : '50px'}
        }}
      />

  </UiEntity>
)


export function setupUi() {
  ReactEcsRenderer.setUiRenderer(uiComponent)
}