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
        width: 250,
        height: 320,
        //  { top: 16, right: 0, bottom: 8 left: 270 },
        margin: '16% 0 0 1%',
        // { top: 4, bottom: 4, left: 4, right: 4 },
        padding: 4,
      }}
      uiBackground={{
        textureMode: 'center',
        texture: {
        src: "images/under-the-sea.png"}
      }}
    >
      <UiEntity
        uiTransform={{
          width: '100%',
          height: '100%',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: {top:24, right:16, bottom:16, left:16},
        }}
        uiBackground={{
          textureMode: 'center',
          texture: {
          src: "images/under-the-sea.png"}
        }}
      >
      <UiEntity
        uiTransform={{
          width: '100%',
          height: '50%',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          margin : {top: "24px", bottom: "24px"}
        }}
        uiBackground={{ color: Color4.Clear()}}
      >
        <Label
          value = {"Pick Horse:"}
          uiTransform={{
            width: '100%',
          }}
          fontSize={16}
          textAlign="middle-center"
        ></Label>

      <Dropdown
        options= {[`Yellow`, `Purple`, `Green`,' Pink']}
        fontSize={16}
        onChange={selectOption}
        uiTransform={{
          width: "100%",
          height: "40px",
          margin : {left : "12px"}
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
          value = {"Bet Amount: "}
          uiTransform={{
              width: '100%',
            }}
            fontSize={16}
            textAlign="middle-center"
        ></Label>
      <Input
        uiTransform={{
          width: "100%",
          height: "40px",
          margin : {left : "12px"}
        }}
        onChange={(e) =>{ amount = parseInt(e) }}
        fontSize={16}
        placeholder={"Your bet"}
        placeholderColor={Color4.Gray()}
        uiBackground={{ color: Color4.White()}}
      />
      </UiEntity>
      <Label
          value = {"Coins: " + playerCash}
          uiTransform={{
            width : "100%",
            height: 16,
            margin: 24
          }}
          fontSize={20}
        ></Label>
      <Button
          uiTransform={{ width: "100%", height: 100, margin: 6 }}
          value='Place Bet'
          variant='primary'
          fontSize={16}
          onMouseDown={() => {
            placeBet(amount)
          }}
        />
        <Button
          uiTransform={{ width: "100%", height: 100, margin: 6 }}
          value='Start Game'
          variant='primary'
          fontSize={16}
          onMouseDown={() => {
          }}
        />
       </UiEntity>
    </UiEntity>
  )



export function setupUi() {
  ReactEcsRenderer.setUiRenderer(uiComponent)
}