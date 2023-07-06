import { Schema, ArraySchema, MapSchema, type } from "@colyseus/schema";

export class Player extends Schema {
  @type("string") name: string;
  @type("number") ranking: number;
  @type("number") horseID : number;
  @type("number") cash : number;
  @type("number") betAmout : number;
}

// TODO remove block
export class Block extends Schema {
  @type("number") x: number;
  @type("number") y: number;
  @type("number") z: number;
}

export class Horse extends Schema {
  @type("number") id: number;
  @type("number") position: number;
}

export class MyRoomState extends Schema {
  @type("number") countdown: number;
  @type([Block]) blocks = new ArraySchema<Block>();//TODO sacar
  @type("number") winPosition : number = 10;
  @type("number") maxPlayers : number = 32;
  @type("number") lobbyWaitingTime : number = 40;
  @type("number") poolPrice : number;
  @type("string") gameStatus: string;
  @type({ map: Player }) players = new MapSchema<Player>();  
  @type({map: Horse}) horses = new MapSchema<Horse>();
}



