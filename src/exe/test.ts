#!/usr/bin/env node

import { ALSA, FFDecoder, SpeedEffector } from '../generated';

const decoder = new FFDecoder(process.argv[2]);

const speedEffector = new SpeedEffector(decoder);

const alsa = new ALSA(speedEffector, 7680);

alsa.startPlay();

const intervalId = setInterval(() => {
    const persist = {
        alsa,
        decoder,
        speedEffector,
    };

    if (persist.alsa.hasStopped()) {
        clearInterval(intervalId);
        process.exit(0);
    }
}, 1000);

/*
setTimeout(() => {
    speedEffector.setSpeedPercent(147);
    const alsaFrames = alsa.getCurrentFrame();
    const decoderFrames = decoder.getCurrentFrame();
    decoder.setCurrentFrame(decoderFrames - alsaFrames);
    alsa.refreshBuffer();
}, 5000);
*/

/*
setTimeout(() => {
    alsa.stop();
}, 5000);
*/

setTimeout(() => {
    alsa.pause();
}, 5000);

setTimeout(() => {
    alsa.resume();
}, 10000);
