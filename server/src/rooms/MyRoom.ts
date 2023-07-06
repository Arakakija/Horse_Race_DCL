import { Room, Client, Delayed } from "colyseus";
import { Block, MyRoomState, Player, Horse, Point, Ring } from "./MyRoomState";

const ROUND_DURATION = 60 * 3;
// const ROUND_DURATION = 30;

// const MAX_BLOCK_HEIGHT = 5;
const MAX_BLOCK_HEIGHT = 19;

export class MyRoom extends Room<MyRoomState> {
  private currentHeight: number = 0;
  private isFinished: boolean = false;
  private roundClock!: Delayed;
  private roundDuration: number = 20;
  onCreate (options: any) {
    this.setState(new MyRoomState());

    // set-up the game!
    this.setUp();
    
    this.onMessage("touch-block", (client: Client, atIndex: number) => {
      // set player new position
      const player = this.state.players.get(client.sessionId);
      player.ranking = atIndex;

      if (atIndex === MAX_BLOCK_HEIGHT) {

        if (!this.isFinished) {
          //
          // winner! reached max block height!
          //
          this.broadcast("finished");
          this.isFinished = true;

          this.clock.setTimeout(() => {
            this.setUp();
          }, 5000);
        }

      } else if (atIndex === this.state.blocks.length) {
        //
        // create a new block at the requested position, if it doesn't yet exist.
        //
        this.createBlock(atIndex);
      } 
    });

    this.onMessage("fall", (client: Client, atPosition: any) => {
      this.broadcast("fall", atPosition);
    });
  }

  setUp() {

    if (this.state.blocks.length > 0) {
      // clear previous blocks
      this.state.blocks.clear();
    }

    if (this.state.horses.size > 0) {
      // clear previous blocks
      this.state.horses.clear();
    }

    // create first block
    this.state.blocks.push(
      new Block().assign({
        x: 8,
        y: 1,
        z: 8,
      })
    );

  const centerPoint: Point = new Point({x : 8, y : 8});
  const radius = 7;
  const numberOfRings = 4;
  const numberOfSegments = 12;
  this.createCircularGrid(centerPoint,radius,numberOfRings,numberOfSegments);


    console.log("Horses On Display", this.state.horses.size)

    this.currentHeight = 1;
    this.isFinished = false;

    // reset all player's ranking position
    this.state.players.forEach((player) => {
      player.ranking = 0;
    });

    this.broadcast("start");

    // setup round countdown
    this.state.countdown = ROUND_DURATION;

    // make sure we clear previous interval
    this.clock.clear();

  }

  createBlock(atIndex: number) {
    const previousBlock2 = this.state.blocks[atIndex - 2];
    const previousBlock = this.state.blocks[atIndex - 1];
    const maxDistance = 4.5;

    const block = new Block();

    //
    // let's set next block position!

    // y is 1 block higher.
    this.currentHeight++;
    block.y = this.currentHeight;

    do {
      // ensure next block's X is not too close to previous block.
      block.x = this._applyBoundaries(previousBlock.x - maxDistance + (Math.random() * (maxDistance * 2)));
    } while (
      Math.abs(block.x - previousBlock.x) < 1 ||
      (previousBlock2 && Math.abs(block.x - previousBlock2.x) < 1)
    );

    do {
      // ensure next block's Z is not too close to previous block.
      block.z = this._applyBoundaries(previousBlock.z - maxDistance + (Math.random() * (maxDistance * 2)));
    } while (
      Math.abs(block.z - previousBlock.z) < 1 ||
      (previousBlock2 && Math.abs(block.z - previousBlock2.z) < 1)
    );

    this.state.blocks.push(block);
  }


  createHorse(atIndex: number) {
    const horse = new Horse().assign({id: atIndex, positionX : 5, positionY : 5});
    this.state.horses.set(`${horse.id}`, horse);
  }

  _applyBoundaries(coord: number) {
    // ensure value is between 1 and 15.
    return Math.max(1, Math.min(15, coord));
  }

  createCircularGrid(center: Point, radius: number, rings: number, segments: number) {
    const anglePerSegment = 360 / segments;
    const distanceBetweenRings = radius / rings;
  
    for (let ring = 0; ring < rings; ring++) {
      const currentRadius = distanceBetweenRings * (ring + 1);
      const newRing = new Ring();
  
      for (let segment = 0; segment < segments; segment++) {
        const angle = (segment * anglePerSegment * Math.PI) / 180; // Convert degrees to radians
        const newX = center.x + currentRadius * Math.cos(angle);
        const newY = center.y + currentRadius * Math.sin(angle);
        newRing.points.push(new Point().assign({x : newX, y : newY}));
      }
  
      this.state.grid.push(newRing);
    }

    console.log("grid is created")
  }

  // FindPoint(x : number, y : number){
  //   return this.state.grid.filter(p => p[0].x === x && p[0].y === y)
  // }

  // FindNextPoint(x : number, y : number){
  //   return this.state.grid.filter(p => p[0].x + 1 === x && p[0].y + 1 === y)
  // }

  onJoin (client: Client, options: any) {
    const newPlayer = new Player().assign({
      name: options.userData.displayName || "Anonymous",
      ranking: 0,
      cash: 500
    });
    this.state.players.set(client.sessionId, newPlayer);

    console.log(this.roomId,this.roomName,newPlayer.name, "joined! => ", options.userData);

    if(this.state.players.size > 2){
      this.state.lobbyWaitingTime = 40;
      this.clock.setInterval(() => {
        if(this.state.lobbyWaitingTime>0){
          this.state.lobbyWaitingTime--
        }
      }, 1000);
    }else{
      this.clock.clear();
    }
    if(this.state.players.size === this.state.maxPlayers){
      this.clock.clear()
      this.startGame(client);
    }
    this.startGame(client)

    //avatar Image on options.userData.data.avatar.snapshots.face256
  }

  onLeave (client: Client, consented: boolean) {
    const player = this.state.players.get(client.sessionId);
    console.log(player.name, "left!");

    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log(this.roomId,this.roomName,"Disposing room...");
  }

  startGame(client: Client){
    this.state.gameStarted = true;
    this.broadcast("game-start");
    const horse1 = new Horse().assign({id: 1, positionX: 0, positionY : 0});
    const horse2 = new Horse().assign({id: 2, positionX: 0, positionY : 0});
    const horse3 = new Horse().assign({id: 3, positionX: 0, positionY : 0});
    const horse4 = new Horse().assign({id: 4,positionX: 0, positionY : 0});
    this.state.horses.set(`${horse1.id}`, horse1);
    this.nextRound();
  }

  endGame(){
    this.broadcast("end-game", {winner: 1})
  }
  
  nextRound(){
    this.clock.start();
    let seconds = this.roundDuration;
    this.roundClock = this.clock.setInterval(() => {
      this.broadcast("round-time", seconds--);
    }, 1000);

    this.clock.setTimeout(() => {
      this.broadcast("end-round", "")
      this.roundClock.clear();
      this.nextRound()
    }, this.roundDuration*1000);
  }
}
  
