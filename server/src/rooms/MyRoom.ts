import { Room, Client } from "colyseus";
import { Block, MyRoomState, Player, Horse } from "./MyRoomState";

const ROUND_DURATION = 60 * 3;
// const ROUND_DURATION = 30;

// const MAX_BLOCK_HEIGHT = 5;
const MAX_BLOCK_HEIGHT = 19;

export class MyRoom extends Room<MyRoomState> {
  private currentHeight: number = 0;
  private isFinished: boolean = false;

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

    // create first block
    this.state.blocks.push(
      new Block().assign({
        x: 8,
        y: 1,
        z: 8,
      })
    );

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

  _applyBoundaries(coord: number) {
    // ensure value is between 1 and 15.
    return Math.max(1, Math.min(15, coord));
  }

  onJoin (client: Client, options: any) {
    const newPlayer = new Player().assign({
      name: options.userData.displayName || "Anonymous",
      ranking: 0,
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
    const horse1 = new Horse().assign({id: 1, position: 0});
    const horse2 = new Horse().assign({id: 2, position: 0});
    const horse3 = new Horse().assign({id: 3, position: 0});
    const horse4 = new Horse().assign({id: 4, position: 0});
    this.state.horses.push(horse1);
    this.nextRound(client);
  }
  nextRound(client: Client){
    let horse1 = this.state.horses[0]
    console.log(horse1)
    horse1.position = 1
    console.log(horse1.position);
    this.broadcast("next-round", this.state.horses)
  }
}
