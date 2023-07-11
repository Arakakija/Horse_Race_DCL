import * as utils from '@dcl-sdk/utils'
//import * as ui from '@dcl/ui-scene-utils';
//import { connect } from "./connection";
import { updateLeaderboard } from './leaderboard';
import { floor } from './scene';
import { ambienceSound, clickSound, fallSound, finishSound1, finishSound2, newLeaderSound, countdownRestartSound, playLoop, playOnce, playOnceRandom } from './sound';
import { log } from './back-ports/backPorts';
import { AudioSource, DeleteComponent, Entity, MeshCollider, MeshRenderer, Schemas, Transform, engine } from '@dcl/sdk/ecs';
import { Quaternion, Vector3 } from '@dcl/sdk/math';
import { addRepeatTrigger, getRandomNumber } from './Utils';
import { MoveHorse, RestartHorse, createHorse } from './horses';
import { Grid, Horse, Roulette } from './custom-components';
import { GenerateGridGraph, createCircularGrid } from './grid';
import { MoveHorseByRoullete, SetDuration, SpinRoullete, StartGame, Update, resetHorses } from './systems';


export let timeToWait : number;
export let playerCash : number = 1000;
export let gameStatus : string;
export let canBet : boolean = true;

export let grid : Entity;
export let horses = Schemas.Array(Schemas.Entity).create();
export let winPosition : number = 11;
export let shouldRotate : boolean = false;

export let playerBet : number = 0;
export let playerHorseId : number = 0;



engine.addSystem(Update)
engine.addSystem(resetHorses)
engine.addSystem(SpinRoullete)


export function initGamePlay(){
    setUp();
    StartBkgMusic();
    //GenerateGridGraph(grid);
    GenerateHorses();
}

function setUp()
{
    const center = Vector3.create(80.05,1,87.68);
    const radius = 10;
    const rings = 4;
    const segments = 12
    grid = createCircularGrid(center,radius,rings,segments);

    SetUpRoulette()
}

function GenerateHorses()
{
    for (let i = 0; i < 4; i++) {
        horses.push(createHorse(i,Grid.get(grid).ring[i].points[0].position));
    }
}

function SetUpRoulette()
{
    const roulette = engine.getEntityOrNullByName("Roulette.glb");
    if(roulette)
    {
        const rouletteComp = Roulette.create(roulette, {
            start: Transform.get(roulette).rotation,
            fraction: 0,
            speed: 1,
            selectedHorse  : 0
        })
        const arrow = engine.getEntityOrNullByName("Indicator Arrow");
        if(arrow)
        {
            initWorldPosition = utils.getWorldPosition(arrow);
        }
        initRototion = rouletteComp.start;
    }
}


export let initRototion : Quaternion;
export let initWorldPosition : Vector3;
export function ActivateRoulette()
{
    const randomDuration = getRandomNumber(1,15);
    SetDuration(randomDuration);
    shouldRotate = true;
    return randomDuration;
}

export function GetAngle(quat : Quaternion)
{
    const angle = Quaternion.angle(initRototion,quat);
    //console.log("Quat " + angle)

    const arrow = engine.getEntityOrNullByName("Indicator Arrow");
    if(arrow)
    {
        const direction  = Vector3.subtract(utils.getWorldPosition(arrow),initWorldPosition)
        //console.log("direction " + Vector3.normalize(direction).x);
        const normalizedVectorX = Vector3.normalize(direction).x;

        if(0 <= angle && angle <= 90 && normalizedVectorX > 0)
        {
           MoveHorseByRoullete(0)
        }

        if(0 <= angle && angle <= 90 && normalizedVectorX < 0)
        {
            MoveHorseByRoullete(1)
        }

        if(angle > 90 && normalizedVectorX < 0)
        {
            MoveHorseByRoullete(2)
        }

        if(angle > 90 && normalizedVectorX > 0)
        {
            MoveHorseByRoullete(3)
        }
    }
}

export function DeactivateRoulette()
{
    shouldRotate = false;
}
    
export function placeBet(horseId : number,amount : number)
{
    if(!canBet || amount > playerCash) return
    playerCash -= amount;
    playerBet = amount;
    playerHorseId = horseId;
    canBet = false;
    StartGame();
}

function StartBkgMusic()
{
    const sourceEntity = engine.addEntity()

    // Create AudioSource component
    const souce = AudioSource.create(sourceEntity, {
        audioClipUrl: 'sounds/bkg.mp3',
        loop: true,
        playing: true
    })


   playSound(sourceEntity)
}

export function StartWonMusic()
{
    const sourceEntity = engine.addEntity()

    // Create AudioSource component
    const souce = AudioSource.create(sourceEntity, {
        audioClipUrl: 'sounds/wow.mp3',
        loop: false,
        playing: true
    })


   playSound(sourceEntity)
}

function playSound(entity: Entity){

    // fetch mutable version of audio source component
    const audioSource = AudioSource.getMutable(entity)
    audioSource.volume = 1;
    // modify its playing value
    audioSource.playing = true
}


export function Win()
{
    playerCash += playerBet * 2;
    playerBet = 0;
    StartWonMusic()
}




/* TODO: FIX THIS Multiplayer
// play ambient music
playLoop(ambienceSound, 0.4);

updateLeaderboard(["- Nobody -"]);
connect("my_room").then((room) => {
    log("Connected!");
    
    // create UI countdown
    //const countdown = new ui.UICounter(0, -30, 30, Color4.White(), 50, false);

    let lastBlockTouched: number = 0;
    let minPosition = 1;


    function refreshLeaderboard() {
        try{
            // get all players names sorted by their ranking 
            const allPlayers = Array.from(room.state.players.values()).sort((a: any, b: any) => {
                return b.ranking - a.ranking;
            }).map((player: any, i: number) => `${i + 1}. ${player.name} - ${player.ranking}`);

            updateLeaderboard(allPlayers);
        }catch(e){
            console.error("refreshLeaderboard","caught error",e)
        }
        
    }

    function PlaceBet(){
        if(!canBet) return;
        console.log("HORSE SELECTED " + betHorse)
        room.send('select-horse',{horseID : betHorse});
    };

    setFunction(PlaceBet);

    let horses : Entity[] = [];
    let lastHorse : Entity;
    room.state.horses.onAdd = (horse: any, i: number) => {
        log("room.state.horses.onAdd","ENTRY");
        console.log("entro a crear caballo");
        lastHorse = AddHorse(horse.id, horse.actualPosition.x, horse.actualPosition.y);
        console.log(lastHorse)
        horses.push(lastHorse);
        
    };

    //TODO: REMOVE THIS
    let pointsPreview : Entity[] = [];
    let lastPointPreview : Entity;
    room.state.grid.onAdd = (ring: any, i: number) => {
        log("room.state.grid.onAdd","ENTRY");
        ring.points.forEach((point : any) => {
            lastPointPreview = engine.addEntity()
            MeshRenderer.setSphere(lastPointPreview);
            Transform.create(lastPointPreview,
                {
                    position : {
                        x : point.x,
                        y : 1,
                        z : point.y, 
                    }
                })
            pointsPreview.push(lastPointPreview);
        });
    };
    const allPoints = Array.from(room.state.grid.values());
    allPoints.forEach((ring :any ) => {

    }
    )


    let highestRanking = 0;
    let highestPlayer: any = undefined;
    room.state.players.onAdd = (player: any, sessionId: string) => {
        player.listen("ranking", (newRanking: number) => {
            if (newRanking > highestRanking) {
                if (player !== highestPlayer) {
                    highestPlayer = player;

                    playOnce(newLeaderSound);
                }
                highestRanking = newRanking;
            }

            refreshLeaderboard();
        });
    }
    // when a player leaves, remove it from the leaderboard.
    room.state.players.onRemove = () => {
        refreshLeaderboard();
    }

    room.state.listen("countdown", (num: number) => {
        log("countdown",num)
        //countdown.set(num);
    })

    room.onMessage("*", (type, message)=>{
        console.log(JSON.stringify(message))
        console.log(type)

        //caballo1 se mueve a la primera posicion
    })

    room.onMessage('place-your-beats',() => {
        //room.send('select-horse',{horseID : "1"});
        canBet = true;
    })

    room.onMessage("game-start", () => {
        log("room.onMessage.start","ENTRY")
        // remove all previous boxes
        //allBoxes.forEach((box) => engine.removeEntity(box));
        //allBoxes = [];

        lastBlockTouched = 0;
        highestRanking = 0;
        highestPlayer = undefined;

  
        //caballo1 se mueve a la primera posicion


        //countdown.show();
    });

    room.onMessage("fall", (atPosition) => {
        playOnce(fallSound, 1, Vector3.create(atPosition.x, atPosition.y, atPosition.z));
    })

    room.onMessage("finished", () => {
        try{
            //ui.displayAnnouncement(`${highestPlayer.name} wins!`, 8, Color4.White(), 60);
            log("finished",`${highestPlayer?.name} wins!`)
            playOnceRandom([finishSound1, finishSound2]);
        }catch(e){
            console.log("room.onMessage.finished","caught error",e)
            console.error(e)
        }
    
       // countdown.hide();
    });

    room.onMessage("restart", () => {
        horses.forEach((horse) => RestartHorses(horse));
    });

    room.onMessage('horse-moved',(horse) => {
        const selectedfHorse = horses.find((h)=>{
            return Horse.get(h).id === horse.id;
        })
        if(selectedfHorse){
            MoveHorse(selectedfHorse,Vector3.create(horse.actualPosition.x,Transform.get(selectedfHorse).position.y, horse.actualPosition.y), horse.actualPosition.rotation);
        }
    });

    room.onMessage('waiting-players-time', (message) => {
        gameStatus = "Waiting for players: ";
        timeToWait = message;

    })

    room.onMessage('time-to-next-round', (message) => {
        gameStatus = "Next Round: ";
        timeToWait = message;

    })


    room.onMessage('bet-time-remaining', (message) => {
        gameStatus = "Place your bets!: ";
        timeToWait = message;
    })

    room.onMessage('player-joined',(data) =>{
        playerCash = data.cash;
    })


    room.onMessage('bet-placed',(data) =>{
        playerCash = data;
        canBet = false;
    })
    
    
    

    room.onLeave((code) => {
        log("onLeave, code =>", code);
    });

}).catch((err) => {
    //error(err);
    console.error(err)

});
}
*/
