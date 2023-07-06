import * as utils from '@dcl-sdk/utils'
//import * as ui from '@dcl/ui-scene-utils';
import { connect } from "./connection";
import { updateLeaderboard } from './leaderboard';
import { floor } from './scene';
import { ambienceSound, clickSound, fallSound, finishSound1, finishSound2, newLeaderSound, countdownRestartSound, playLoop, playOnce, playOnceRandom } from './sound';
import { log } from './back-ports/backPorts';
import { AudioSource, Entity, MeshCollider, MeshRenderer, Transform, engine } from '@dcl/sdk/ecs';
import { Vector3 } from '@dcl/sdk/math';
import { addRepeatTrigger } from './Utils';


export function initGamePlay(){
    // play ambient music
    playLoop(ambienceSound, 0.4);

    updateLeaderboard(["- Nobody -"]);

//
// Connect to Colyseus server! 
// Set up the scene after connection has been established.
//
connect("my_room").then((room) => {
    log("Connected!");
    
    // create UI countdown
    //const countdown = new ui.UICounter(0, -30, 30, Color4.White(), 50, false);

    let lastBlockTouched: number = 0;
    function onTouchBlock(y: number) {
        // send block index and player position to Colyseus server
        lastBlockTouched = y;
        room.send("touch-block", y);
    }

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

    // The "floor" object was originally named "entity" from the Decentraland Builder.
    // I exported it from the "./scene" file to be able to attach custom behaviour.
    utils.triggers.enableDebugDraw(true)
    
    addRepeatTrigger(
        Vector3.create(16, 2, 16), Vector3.create(0, 0, 0),
        (entity:Entity) => { 
            log('player.enter.floorTriggerShape',entity)
            if (lastBlockTouched > 2 && lastBlockTouched < 20) {
                room.send("fall", Transform.get(engine.PlayerEntity).position);
            }
        },
        floor,
        false,
        () => {
            log('player.exit.floorTriggerShape')
        }
    )
    
    /// --- Spawner function ---
    function spawnCube(x: number, y: number, z: number) {
        // create the entity
        const cube = engine.addEntity()
         
        MeshRenderer.setBox(cube)
        MeshCollider.setBox(cube)
 
        // add a transform to the entity
        Transform.create(cube,{ position: Vector3.create(x, y, z) })
        /*
        // set random color/material for the cube
        const cubeMaterial = new Material()
        cubeMaterial.albedoColor = Color3.Random();
        cubeMaterial.metallic = Math.random();
        cubeMaterial.roughness = Math.random();
        cube.addComponent(cubeMaterial);
        */
       
        addRepeatTrigger(
            Vector3.create(0.7, 1, 0.7),// position,
             Vector3.create(0, 2, 0), // size
            (entity:Entity) => {
                log('player.enter.touch.cube',entity)
                onTouchBlock(y);
            },
            cube,
            false,
            () => {
                //log('player.exit.touch.cube')
            }
        )

        utils.tweens.startScaling(cube,
            Vector3.create(0, 0, 0), Vector3.create(1, 1, 1),.2
            )
        
        // play click sound
        AudioSource.createOrReplace(cube,
            {
                audioClipUrl:"sounds/click.mp3",
                loop:false,
                playing:true
            })

        return cube;
    }

    //
    // -- Colyseus / Schema callbacks -- 
    // https://docs.colyseus.io/state/schema/
    //
    let allBoxes: Entity[] = []; 
    let lastBox: Entity;
    room.state.blocks.onAdd = (block: any, i: number) => {
        log("room.state.blocks.onAdd","ENTRY")
        lastBox = spawnCube(block.x, block.y, block.z);
        allBoxes.push(lastBox);
    };

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
        //log(JSON.stringify(message))
        //log(type)
        console.log(JSON.stringify(message))
        console.log(type)
    })

    room.onMessage("start", () => {
        log("room.onMessage.start","ENTRY")
        // remove all previous boxes
        allBoxes.forEach((box) => engine.removeEntity(box));
        allBoxes = [];

        lastBlockTouched = 0;
        highestRanking = 0;
        highestPlayer = undefined;

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
        playOnce(countdownRestartSound);
    });

    room.onLeave((code) => {
        log("onLeave, code =>", code);
    });

}).catch((err) => {
    //error(err);
    console.error(err)

});
}