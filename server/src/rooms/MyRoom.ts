import { Room, Client, Delayed } from "colyseus";
import { MyRoomState, Player, Horse } from "./MyRoomState";

const GAME_STATUS = Object.freeze({
  WAITING_FOR_PLAYERS: 'WAITING_FOR_PLAYER',
  STARTED: 'STARTED',
  FINISHED: 'FINISHED',
  PLACING_BETS: 'PLACING_BETS'
});
const LOBBY_TIME = 40
const ROUND_DURATION = 20;
const BETTING_TIME = 30;

export class MyRoom extends Room<MyRoomState> {
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

  onJoin (client: Client, options: any) {
    const newPlayer = new Player().assign({
      name: options.userData.displayName || "Anonymous",
      horseID: null,
      cash: 500
    });
    if(this.maxClients >= this.state.players.size){
      this.state.players.set(client.sessionId, newPlayer);
    }
    this.broadcast('player-joined', {user: options.userData.displayName, horses: this.state.horses})
  }

  onLeave (client: Client, consented: boolean) {
    const player = this.state.players.get(client.sessionId);
    console.log(player.name, "left!");
    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log(this.roomId,this.roomName, "Disposing room...");
  }

  startGame(missingBeats?: boolean){
    this.broadcast('place-your-beats', {missingBeats})
    this.state.gameStatus = GAME_STATUS.PLACING_BETS;
    this.state.bettingTime = BETTING_TIME
    this.clock.setInterval(()=>{
      if(this.state.bettingTime > 0){
        this.state.bettingTime--
        this.broadcast('betting-timer', { time: this.state.lobbyWaitingTime });
      }else{
        
        if(this.allPlayersSelectedAHorse()){
          this.clock.clear()
          this.state.gameStatus = GAME_STATUS.STARTED;
          this.broadcast("game-start");
          this.nextRound();
        }else{
          this.clock.clear()
          this.startGame(true);
        }
      }
    }, 1000)
  }

  nextRound(){
    
  }

  setLobbyClock(){
    this.clock.start();
    this.state.lobbyWaitingTime = LOBBY_TIME;
    this.clock.setInterval(() => {
      if(this.state.lobbyWaitingTime > 0){
        this.state.lobbyWaitingTime--
        this.broadcast('lobby-timer', { time: this.state.lobbyWaitingTime });
      }else{
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
    if(this.state.gameStatus === GAME_STATUS.PLACING_BETS){
      this.onMessage('select-horse', (client:Client, message)=>{
        const player = this.state.players.get(client.sessionId);
        player.horseID = message.horseID;
      })
    }
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
  
  
    
}
