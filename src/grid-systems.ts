import {
    Entity,
    engine,
  } from '@dcl/sdk/ecs'
  import { Tile } from './custom-components';
  
  
  export function GetTile(positionX : number, positionY: number) : Entity
  {
      let tile = engine.addEntity();
      for(const [tileEntity] of engine.getEntitiesWith(Tile))
      {
        if(Tile.get(tileEntity).id.idX === positionX && Tile.get(tileEntity).id.idY === positionY)
        {
          tile = tileEntity;
        }
      }
      return tile
  }
