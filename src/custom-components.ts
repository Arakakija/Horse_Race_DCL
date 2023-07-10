import { ComponentData, ComponentType, EntityMappingMode, Schemas, engine } from '@dcl/sdk/ecs'
import { Color4 } from '@dcl/sdk/math';


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
            points: Schemas.Array(Schemas.Vector3),
        })),
})