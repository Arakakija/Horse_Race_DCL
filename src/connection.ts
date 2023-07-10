//
// IMPORTANT :
// - trying vanilla without refernce imports and see if it works
//

import { Color4 } from "@dcl/sdk/math";
import { Client, Room } from "colyseus.js";
import { log } from "./back-ports/backPorts";
import { getUserData } from "~system/UserIdentity"
import { getRealm } from "~system/Runtime"
//import { isPreviewMode, getCurrentRealm } from '@decentraland/EnvironmentAPI'
//import { getUserData } from "@decentraland/Identity";



export async function connect(roomName: string, options: any = {}) {

    const realm = await getRealm({

    });
    const isPreview = realm.realmInfo?.isPreview

    //
    // make sure users are matched together by the same "realm".
    //
    options.realm = realm?.realmInfo?.realmName;
    options.userData = await getUserData({});

    log("userData:", options.userData);

    // const ENDPOINT = "wss://hept-j.colyseus.dev";
    const ENDPOINT = (isPreview)
        ? "ws://127.0.0.1:2567" // local environment
        : "wss://horse-race-websocket.onrender.com:10000"; // production environment

    if (isPreview) { addConnectionDebugger(ENDPOINT); }
    const client = new Client(ENDPOINT);

    try {
        //
        // Docs: https://docs.colyseus.io/client/client/#joinorcreate-roomname-string-options-any
        //
        const room = await client.joinOrCreate<any>(roomName, options);
        if (isPreview) { updateConnectionDebugger(room); }

        return room;

    } catch (e) {
        console.error(e)
        //updateConnectionMessage(`Error: ${e.message}`, Color4.Red())
        throw e;
    }
}

//let message: UIText;

function addConnectionDebugger(endpoint: string) {
   /* const canvas = new UICanvas()
    message = new UIText(canvas)
    message.fontSize = 15
    message.width = 120
    message.height = 30
    message.hTextAlign = "center";
    message.vAlign = "bottom"
    message.positionX = -80*/
    updateConnectionMessage(`Connecting to ${endpoint}`, Color4.White());
}

function updateConnectionMessage(value: string, color: Color4) {
    console.log("updateConnectionMessage",value)
    /*message.value = value;
    message.color = color;*/
}

function updateConnectionDebugger(room: Room) {
    updateConnectionMessage("Connected.", Color4.Green());
    room.onLeave(() => updateConnectionMessage("Connection lost", Color4.Red()));
}