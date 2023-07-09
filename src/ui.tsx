import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { ReactEcsRenderer, UiEntity } from '@dcl/sdk/react-ecs'
import { gameStatus, timeToWait } from './gameplay'

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

    
  </UiEntity>
)


export function setupUi() {
  ReactEcsRenderer.setUiRenderer(uiComponent)
}