import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { Button, Dropdown, Label, ReactEcsRenderer, UiEntity } from '@dcl/sdk/react-ecs'
import { gameStatus, playerCash, timeToWait } from './gameplay'
import { Color4Type } from '@dcl/sdk/ecs'

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
    uiTransform = {{
      width:'100%',
      height: '100%',
      margin: { top: '0%', left: '0%'}
    }}
    uiBackground={{ color: Color4.Clear() }}
  >
    <UiEntity
        uiTransform={{
            width: 100,
            height: 100,
            margin: { top: '0%', left: '40%' }
        }}
        uiText={{ value: gameStatus + timeToWait , fontSize: 30 }}
    />
    <Label value="Select a color"
        fontSize={18}
        color={Color4.Green()}
        uiTransform={{
          width: "140px",
          height: "40px",
        }}
      />
      <Dropdown
        options= {[`Horse 1`, `Horse 2`, `Horse 3`,'Horse 4']}
        onChange={selectOption}
        uiTransform={{
          width: "100px",
          height: "40px",
        }}
        uiBackground={{color: Color4.Gray()}}
      />


    <Button
			value="BET"
			uiTransform={{ width: 80, height: 20, margin: 4 }}
			onMouseDown={placeBet}
		/>

<Label
uiTransform={{margin: {left : '10%'}}}
      value={"CASH: " + playerCash}
      fontSize={20}
    />

    
  </UiEntity>
)


export function setupUi() {
  ReactEcsRenderer.setUiRenderer(uiComponent)
}