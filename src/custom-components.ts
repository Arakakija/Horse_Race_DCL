import { ComponentData, ComponentType, EntityMappingMode, Schemas, engine } from '@dcl/sdk/ecs'
import { Color4 } from '@dcl/sdk/math';

const RouletteData = {
    start: Schemas.Quaternion,
    end: Schemas.Quaternion,
    fraction: Schemas.Float,
    speed: Schemas.Float,
    selectedHorse : Schemas.Float
  }

export const Horse = engine.defineComponent('Horse',{
    id: Schemas.Int,
    startPosition: Schemas.Vector3,
    actualPosition: Schemas.Int
})


export const Grid = engine.defineComponent('Grid',
{
    ring : Schemas.Array(Schemas.Map(
        {
            id: Schemas.Int,
            points: Schemas.Array(Schemas.Map({
                position : Schemas.Vector3,
                rotation : Schemas.Quaternion,
            }))
        })),
})

export const Roulette = engine.defineComponent('Roulette',RouletteData)

export const AudioSource = engine.defineComponent('AudioSource',
{
    audioClipUrl: Schemas.String,
    loop: Schemas.Boolean,
    playing: Schemas.Boolean
})