#!/usr/bin/env node

import { Player } from "../Player";

const player = new Player();

player.play(process.argv[2]);

setInterval(() => {
    if(player.getTime() >= player.getLength()) {
        console.log("Trying to stop");
        player.stop().then(() => {
            console.log("stopped");
            player.play(process.argv[2]);
        });
    }
}, 1000);

setTimeout(() => {
    console.log("set speed to 1.5");
    player.setSpeed(1.5);
}, 3000);