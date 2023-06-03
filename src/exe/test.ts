#!/usr/bin/env node

import { ALSA, FFDecoder } from '../generated';

const decoder = new FFDecoder(process.argv[2]);

const alsa = new ALSA(decoder, 768 * 6);

alsa.startPlay();

setInterval(() => {
    let _alsa = alsa;
    let _decoder = decoder;
}, 1000);
