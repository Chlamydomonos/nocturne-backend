#!/usr/bin/env node

import { ALSA, WAVDecoder } from '../generated';

const ccLib = require('../../build/Debug/ccLib.node');

const decoder = new WAVDecoder(process.argv[2]);

const alsa = new ALSA(decoder, 768 * 6);

alsa.startPlay();

setInterval(() => {
    const persist = {
        alsa,
        decoder,
    };
    const sampleRate = ccLib.getSampleRate(decoder.getMetadata().value);
    console.log('Sample rate: ', sampleRate);
}, 1000);

setTimeout(() => {
    console.log('Try to play second 2');
    const alsaFrame = alsa.getCurrentFrame();
    const decoderFrame = decoder.getCurrentFrame();
    decoder.setCurrentFrame(88200);
    alsa.refreshBuffer();
}, 5000);

setTimeout(() => {
    console.log('This is second 2');
}, 2000);
