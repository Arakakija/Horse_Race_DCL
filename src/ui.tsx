import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { Button, Dropdown, Input, Label, ReactEcsRenderer, UiEntity } from '@dcl/sdk/react-ecs'
import { Color4Type, Font } from '@dcl/sdk/ecs'
import { cooldown } from './systems';
import { placeBet, playerCash } from './gameplay';

export let betHorse : number = 0;
let amount : number = 0;

function selectOption(index: number) {
    betHorse = index
  }
  
  const uiComponent = () => (
    <UiEntity
      uiTransform={{
        width: 150,
        height: 250,
        //  { top: 16, right: 0, bottom: 8 left: 270 },
        margin: '200px 0 8px 20px',
        // { top: 4, bottom: 4, left: 4, right: 4 },
        padding: 4,
      }}
      uiBackground={{ color: Color4.create(0.5, 0.8, 0.1, 0.6) }}
    >
      <UiEntity
        uiTransform={{
          width: '500%',
          height: '100%',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
        uiBackground={{ color: Color4.fromHexString("#70ac76ff") }}
      >
      <UiEntity
        uiTransform={{
          width: '100%',
          height: '50px',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          margin : {bottom: "10px"}
        }}
        uiBackground={{ color: Color4.Clear()}}
      >
        <Label
          value = {"Select Horse: "}
          uiTransform={{
            margin : {bottom: "10px", left : "30px"}
          }}
        ></Label>
      <Dropdown
        options= {[`Yellow`, `Purple`, `Green`,' Pink']}
        fontSize={8}
        onChange={selectOption}
        uiTransform={{
          width: "50%",
          height: "40px",
          margin : {right : "5px"}
        }}
        uiBackground={{color: Color4.White()}}
      />
      </UiEntity>

      <UiEntity
        uiTransform={{
          width: '100%',
          height: '50px',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          margin : {bottom: "10px"}
        }}
        uiBackground={{ color: Color4.Clear()}}
      >
        <Label
          value = {"Amount To Bet: "}
          uiTransform={{
            width : "10%",
            margin : {bottom: "20px", left : "35px"}
          }}
          fontSize={9.5}
        ></Label>
      <Input
        uiTransform={{
          width : "40%",
          height: '30px',
          margin : {top: "5px", right : "10px"}
        }}
        onChange={(e) =>{ amount = parseInt(e) }}
        fontSize={9}
        placeholder={""}
        placeholderColor={Color4.Gray()}
        uiBackground={{ color: Color4.White()}}
      />
      </UiEntity>

      <Label
          value = {"Cash: " + playerCash}
          uiTransform={{
            width : "10%",
            margin : {bottom: "50px", left : "35px"}
          }}
          fontSize={20}
        ></Label>

      <Button
          uiTransform={{ width: 100, height: 40, margin: 8 }}
          value='Place Bet'
          variant='primary'
          fontSize={14}
          onMouseDown={() => {
            placeBet(amount)
          }}
        />
        <Button
          uiTransform={{ width: 100, height: 40, margin: 8 }}
          value='Start Game'
          variant='primary'
          fontSize={14}
          onMouseDown={() => {
          }}
        />
       </UiEntity>
    </UiEntity>
  )



export function setupUi() {
  ReactEcsRenderer.setUiRenderer(uiComponent)
}