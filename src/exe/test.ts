#!/usr/bin/env node

import { Player } from "../Player";

const player = new Player();

player.play(process.argv[2]);

setInterval(() => {
    console.log("time:", player.getTime());
}, 1000);

setTimeout(() => {
    console.log("length:", player.getLength());
    player.setSpeed(1.5);
}, 5000);