import { Room, Client, Delayed } from "colyseus";
import { Block, MyRoomState, Player, Horse } from "./MyRoomState";

const ROUND_DURATION = 60 * 3;
// const ROUND_DURATION = 30;

// const MAX_BLOCK_HEIGHT = 5;
const MAX_BLOCK_HEIGHT = 19;

const GAME_STATUS = Object.freeze({
  WAITING_FOR_PLAYERS: 'WAITING_FOR_PLAYER',
  STARTED: 'STARTED',
  FINISHED: 'FINISHED'
})

export class MyRoom extends Room<MyRoomState> {
  private currentHeight: number = 0;
  private isFinished: boolean = false;
  private roundClock!: Delayed;
  private roundDuration: number = 20;
  onCreate (options: any) {
    this.setState(new MyRoomState());
    // set-up the game!
    this.setUp();
  }

  setUp() {
    this.resetHorses()
    this.clock.clear();
    this.startWaitingPlayers()
  }

  resetHorses(){
    const horse1 = new Horse().assign({id: 1, position: 0});
    const horse2 = new Horse().assign({id: 2, position: 0});
    const horse3 = new Horse().assign({id: 3, position: 0});
    const horse4 = new Horse().assign({id: 4, position: 0});

    this.state.horses.set('1', horse1);
    this.state.horses.set('2', horse2);
    this.state.horses.set('3', horse3);
    this.state.horses.set('4', horse4);
  }

  

  _applyBoundaries(coord: number) {
    // ensure value is between 1 and 15.
    return Math.max(1, Math.min(15, coord));
  }

  onJoin (client: Client, options: any) {
    const newPlayer = new Player().assign({
      name: options.userData.displayName || "Anonymous",
      horseID: null,
      cash: 500
    });
    if(this.maxClients >= this.state.players.size){
      this.state.players.set(client.sessionId, newPlayer);
    }
  }

  onLeave (client: Client, consented: boolean) {
    const player = this.state.players.get(client.sessionId);
    console.log(player.name, "left!");

    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log(this.roomId,this.roomName, "Disposing room...");
  }

  startGame(){
    this.state.gameStatus = GAME_STATUS.STARTED;
    this.broadcast("game-start");
  }

  setLobbyClock(){
    this.state.lobbyWaitingTime = 40;
    this.clock.setInterval(() => {
      if(this.state.lobbyWaitingTime>0){
        this.state.lobbyWaitingTime--
        this.broadcast('lobby-timer', { time: this.state.lobbyWaitingTime });
      }
      if(this.state.players.size === this.state.maxPlayers){
        this.clock.clear()
        this.startGame();
        return
      }
      if(this.state.lobbyWaitingTime === 0){
        if(this.minimumPlayersIn()){
          this.clock.clear();
          this.startGame();
          return
        }else{
          this.clock.clear();
          this.setLobbyClock();
          return
        }
      }
    }, 1000);
  }

  minimumPlayersIn(){
    return this.state.players.size > 2
  }
  
  startWaitingPlayers(){
    this.state.gameStatus = GAME_STATUS.WAITING_FOR_PLAYERS;
    this.broadcast('waiting-players', {});
    this.setLobbyClock();
  }

  playerSelectsHorse(){
    this.onMessage('select-horse', (client:Client, message)=>{
      const player = this.state.players.get(client.sessionId);
      player.horseID = message.horseID;
    })
  }

  allPlayersSelectedAHorse(){
    let allPlayersSelected = true;
    this.state.players.forEach((player)=>{
      if(player.horseID === null){
        allPlayersSelected = false;
      }
    });
    return allPlayersSelected;
  }

  endGame(horse: Horse){
    this.broadcast("end-game", horse);
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
