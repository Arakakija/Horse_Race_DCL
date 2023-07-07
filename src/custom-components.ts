import { ComponentData, ComponentType, EntityMappingMode, Schemas, engine } from '@dcl/sdk/ecs'
import { Color4 } from '@dcl/sdk/math';


export const Horse = engine.defineComponent('Horse',{
    id: Schemas.Int,
    startPosition: Schemas.Vector3,
    actualPosition: Schemas.Int
})

export const Grid = engine.defineComponent('Grid',{
    sizeX : Schemas.Int,
    sizeY: Schemas.Int,
    grid: Schemas.Map({
        positionX: Schemas.Array(Schemas.Int),
        positionY: Schemas.Array(Schemas.Int)
    })
})

export const Tile = engine.defineComponent('Tile',{
    id: Schemas.Map({
        idX: Schemas.Int,
        idY: Schemas.Int
    }),
});
