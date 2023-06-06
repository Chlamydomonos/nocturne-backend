import * as fs from 'fs';
import { ALSA, FFDecoder, SpeedEffector } from './generated';
import { getSampleRate } from './CCLibWrapper';
import { IgnoreNocturne } from './reflect';

export enum PlayStatus {
    STOP = 0,
    PLAY = 1,
    PAUSE = 2,
}

export class Player {
    @IgnoreNocturne
    private size = 7680;

    @IgnoreNocturne
    private volume = 100;

    @IgnoreNocturne
    private playStatus = PlayStatus.STOP;

    @IgnoreNocturne
    private decoder?: FFDecoder;

    @IgnoreNocturne
    private speedEffector?: SpeedEffector;

    @IgnoreNocturne
    private alsa?: ALSA;

    private timeToFrame(time: number) {
        const sampleRate = getSampleRate(this.decoder!.getMetadata());
        return Math.floor(time * sampleRate);
    }

    private frameToTime(frame: number) {
        const sampleRate = getSampleRate(this.decoder!.getMetadata());
        return frame / sampleRate;
    }

    async play(file: string) {
        if (!fs.existsSync(file)) {
            return 1;
        }
        if (!fs.statSync(file).isFile()) {
            return 2;
        }
        if (this.alsa) {
            await this.stop();
        }
        this.decoder = new FFDecoder(file);
        this.speedEffector = new SpeedEffector(this.decoder);
        this.alsa = new ALSA(this.speedEffector, this.size);
        this.alsa.startPlay();

        this.playStatus = PlayStatus.PLAY;
        return 0;
    }

    async stop() {
        if (!this.alsa) {
            return 1;
        }
        this.alsa.stop();
        return new Promise<number>((resolve, _reject) => {
            const intervalId = setInterval(() => {
                if (this.alsa!.hasStopped()) {
                    clearInterval(intervalId);
                    this.alsa = undefined;

                    this.playStatus = PlayStatus.STOP;
                    resolve(0);
                }
            }, 100);
        });
    }

    pause() {
        if (!this.alsa) {
            return 1;
        }
        this.alsa.pause();
        this.playStatus = PlayStatus.PAUSE;
        return 0;
    }

    resume() {
        if (!this.alsa) {
            return 1;
        }
        this.alsa.resume();
        this.playStatus = PlayStatus.PLAY;
        return 0;
    }

    getPlayStatus() {
        return this.playStatus;
    }

    setVolume(volume: number) {
        if (!this.alsa) {
            return 1;
        }
        this.alsa.setVolume(volume);
        return 0;
    }

    getVolume() {
        return this.volume;
    }

    setSpeed(speed: number) {
        if (!this.alsa) {
            return 1;
        }
        this.setTime(this.getTime());
        this.speedEffector!.setSpeedPercent(speed * 100);
        return 0;
    }

    getSpeed() {
        if (!this.speedEffector) {
            return -1;
        }
        return this.speedEffector.getSpeedPercent() / 100;
    }

    setTime(time: number) {
        if (!this.alsa) {
            return 1;
        }
        const frame = Math.floor(this.timeToFrame(time));
        if (frame < 0 || frame > this.decoder!.getTotalFrames()) {
            return 2;
        }
        this.decoder!.setCurrentFrame(frame);
        this.alsa!.refreshBuffer();
        return 0;
    }

    getTime() {
        if (!this.alsa) {
            return -1;
        }
        const decoderFrames = this.decoder!.getCurrentFrame();
        const alsaFrames = this.alsa.getCurrentFrame();

        const realSpeed = this.speedEffector!.getRealSpeed(this.size);
        const realAlsaFrames = alsaFrames / realSpeed;
        return this.frameToTime(decoderFrames - realAlsaFrames);
    }

    getLength() {
        if (!this.alsa) {
            return -1;
        }
        const frame = this.decoder!.getTotalFrames();
        return Math.floor(this.frameToTime(frame));
    }
}
