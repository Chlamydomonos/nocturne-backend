#!/usr/bin/env node

import { ALSA, FFDecoder, SpeedEffector } from '../generated';

const ccLib = require('../../build/Debug/ccLib.node');

const decoder = new FFDecoder(process.argv[2]);

const speedEffector = new SpeedEffector(decoder);

const alsa = new ALSA(speedEffector, 7680);

alsa.startPlay();

setInterval(() => {
    const persist = {
        alsa,
        decoder,
        speedEffector,
    };
}, 1000);

setTimeout(() => {
    speedEffector.setSpeedPercent(200);
    const alsaFrames = alsa.getCurrentFrame();
    const decoderFrames = decoder.getCurrentFrame();
    decoder.setCurrentFrame(decoderFrames - alsaFrames);
    alsa.refreshBuffer();
}, 5000);
