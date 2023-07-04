

// Import the custom gameplay code.
import { initGamePlay } from "./gameplay";

import "./polyfill/delcares";
import { initStatic } from "./scene";

 
// export all the functions required to make the scene work
export * from '@dcl/sdk'

export function main(){
    //initStatic() 
    initGamePlay() 
}