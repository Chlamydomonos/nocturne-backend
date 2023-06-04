import { Player } from './Player';
import { db, SimpleSong } from './db';
import PlayListManager from './PlayListManager';
import { IgnoreNocturne } from './reflect';
import SongManager from './SongManager';
import { PublicFields } from './type-helper';

export default class Nocturne {
    constructor() {
        this.playListManager = new PlayListManager();
        this.songManager = new SongManager();
    }

    public player: PublicFields<Player> = new Player();
    public playListManager: PublicFields<PlayListManager>;
    public songManager: PublicFields<SongManager>;

    @IgnoreNocturne
    private currentSong: SimpleSong = { id: -1, name: '', path: '' };

    async init() {
        await db.sync();
        await this.playListManager.cleanDB();
    }

    @IgnoreNocturne
    isIgnored(key: string) {
        const keys = key.split('.');
        const last = keys.pop()!;
        let value: any = this;
        for (const k of keys) {
            value = value[k];
            if (!value) {
                return false;
            }
        }

        console.log(Reflect.getMetadataKeys(value));
        const meta = Reflect.getMetadata('ignore-nocturne', value);
        if (!meta) {
            return false;
        }
        return meta.has(last) as boolean;
    }

    play(song: SimpleSong) {
        return this.player.play(song.path);
    }

    getCurrentSong() {
        return this.currentSong;
    }
}
