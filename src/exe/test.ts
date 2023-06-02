#!/usr/bin/env node

import { ALSA, FFDecoder } from '../generated';

console.log(process.argv);

const decoder = new FFDecoder(process.argv[2]);

const alsa = new ALSA(decoder);

console.log(alsa);

alsa.startPlay();
alsa.setVolume(10000);

setTimeout(() => console.log('test'), 10000);
