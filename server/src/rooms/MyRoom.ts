import { Room, Client, Delayed } from "colyseus";
import { MyRoomState, Player, Horse, Ring, Point } from "./MyRoomState";

const GAME_STATUS = Object.freeze({
  WAITING_FOR_PLAYERS: 'WAITING_FOR_PLAYER',
  IN_PROGRESS: 'IN_PROGRESS',
  FINISHED: 'FINISHED',
  PLACING_BETS: 'PLACING_BETS',
});

function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const LOBBY_TIME =10
const ROUND_DURATION = 5;
const BETTING_TIME = 10;

export class MyRoom extends Room<MyRoomState> {
  onCreate (options: any) {
    this.setState(new MyRoomState());
    // set-up the game!
    this.setUp();

    this.onMessage('move-horse', (client:Client, message)=>{
        console.log("horse moved")
    })

    this.onMessage('select-horse', (client:Client, message)=>{
      this.playerSelectsHorse(client, message)
    })
  }

  setUp() {
    const centerPoint: Point = new Point({x : 8, y : 8});
    const radius = 5;
    const numberOfRings = 4;
    const numberOfSegments = 4;
    this.state.winPosition = numberOfSegments
    this.createCircularGrid(centerPoint,radius,numberOfRings,numberOfSegments);
    this.clock.clear();
    this.startWaitingPlayers()
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
        newRing.points.push(new Point().assign({x : newX, y : newY, rotation : angle}));
      }
      this.state.grid.push(newRing);
    }
  }

  getRing(ringID : number) : Ring
  {
     return this.state.grid[ringID];
  }

  getPosition(ringID : number, point : number) : Point
  {
    return this.getRing(ringID -1).points[point];
  }

  resetHorses(){
    const horse1 = new Horse().assign({id: 1, position: 0, actualPosition : this.getPosition(1,0)});
    const horse2 = new Horse().assign({id: 2, position: 0, actualPosition : this.getPosition(2,0)});
    const horse3 = new Horse().assign({id: 3, position: 0, actualPosition : this.getPosition(3,0)});
    const horse4 = new Horse().assign({id: 4, position: 0, actualPosition : this.getPosition(4,0)});

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
      this.checkPlayers()
      if(this.state.bettingTime > 0){
        this.state.bettingTime--
        this.broadcast('bet-time-remaining', this.state.bettingTime);
      }else{
        this.clock.clear()
        this.state.gameStatus = GAME_STATUS.IN_PROGRESS;
        this.broadcast("game-start");
        this.nextRound();
      }
    }, 1000)
  }

  nextRound(){
      const currentHorse =  this.getRandomHorse();
      currentHorse.position++;
      currentHorse.actualPosition = this.getPosition(currentHorse.id, currentHorse.position)

      if(this.checkIfHorseWon(currentHorse)){
        currentHorse.position = 0;
        currentHorse.actualPosition = this.getPosition(currentHorse.id, currentHorse.position)
        this.broadcast('horse-moved', currentHorse.toJSON())
        this.endGame(currentHorse)
      }else{
        this.broadcast('horse-moved', currentHorse.toJSON())
        this.checkIfHorsesMustGoBack()
        //this.nextRound()
        this.clock.clear()
        this.state.roundTime = ROUND_DURATION
        this.clock.setInterval(()=>{
          if(this.state.roundTime > 0){
            this.state.roundTime--
            this.broadcast('time-to-next-round', this.state.roundTime);
          }else{
            this.clock.clear()
            this.nextRound();
          }
        }, 1000)
      }
    
  }
  getRandomHorse(){
    const horseID = String(getRandomNumber(1,4));
    return this.state.horses.get(horseID)
  }

  checkIfHorsesMustGoBack(){
    let counter = 0;
    this.state.horses.forEach((horse)=>{
      if(horse.position >= this.state.backPosition){ 
        counter++ 
      console.log("Counter: " + counter)
    }
    })
    if(counter>=4){
      const horse = this.getRandomHorse()
      this.state.backPosition++;
      horse.position--
      horse.actualPosition = this.getPosition(horse.id, horse.position)
      this.broadcast('horse-moved', horse.toJSON())
    }

  }

  checkIfHorseWon(horse: Horse){
    return horse.position >= this.state.winPosition;
  }
  
  checkPlayers(){
    if(this.state.players.size === 0){
      this.clock.clear()
      this.startWaitingPlayers();
    }

  }
  
  setLobbyClock(){
    this.resetHorses()
    this.broadcast('restart');
    this.clock.start();
    this.state.lobbyWaitingTime = LOBBY_TIME;
    this.clock.setInterval(() => {
      if(this.state.lobbyWaitingTime > 0){
        this.state.lobbyWaitingTime--
        this.broadcast('waiting-players-time', this.state.lobbyWaitingTime);
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
    return this.state.players.size > 0 // CHANGE TO 2
  }
  
  startWaitingPlayers(){
    this.state.gameStatus = GAME_STATUS.WAITING_FOR_PLAYERS;
    this.setLobbyClock();
  }

  playerSelectsHorse(client: Client, message: any){
    if(this.state.gameStatus === GAME_STATUS.PLACING_BETS){
        const player = this.state.players.get(client.sessionId);
        player.horseID = message.horseID;
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
    this.state.gameStatus = GAME_STATUS.FINISHED;
    this.state.backPosition = 1;
    this.broadcast("end-game", {horse});
    this.setLobbyClock()
  }

}
