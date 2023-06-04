import * as fs from 'fs';
import * as path from 'path';
import { IgnoreNocturne } from './reflect';
import { PlayList, SimplePlayList, SimpleSong, Song } from './db';

export default class SongManager {
    async getSongs(playList: SimplePlayList) {
        const playListInstance = await PlayList.findByPk(playList.id);
        if (!playListInstance) {
            throw new Error('PlayList not found');
        }
        const songs = await playListInstance.getSongs();
        return songs.map<SimpleSong>((song) => {
            return {
                id: song.id,
                name: song.name,
                path: song.path,
            };
        });
    }

    async addSong(playList: SimplePlayList, song: SimpleSong) {
        const playListInstance = await PlayList.findByPk(playList.id);
        if (!playListInstance) {
            throw new Error('PlayList not found');
        }
        const songInstance = await Song.findByPk(song.id);
        if (!songInstance) {
            throw new Error('Song not found');
        }
        await playListInstance.addSong(songInstance);
    }

    async removeSong(playList: SimplePlayList, song: SimpleSong) {
        const playListInstance = await PlayList.findByPk(playList.id);
        if (!playListInstance) {
            throw new Error('PlayList not found');
        }
        const songInstance = await Song.findByPk(song.id);
        if (!songInstance) {
            throw new Error('Song not found');
        }
        await playListInstance.removeSong(songInstance);
    }

    async renameSong(song: SimpleSong, newName: string) {
        const songInstance = await Song.findByPk(song.id);
        if (!songInstance) {
            throw new Error('Song not found');
        }
        songInstance.name = newName;
        await songInstance.save();
    }

    @IgnoreNocturne
    private static EXTENSIONS = new Set<string>(['.wav', '.mp3', '.flac', 'ogg', 'aac']);

    async loadSong(file: string, sPlayList: SimplePlayList) {
        const isFile = await this.checkFile(file);
        if (!isFile) {
            throw new Error('Path is not a file');
        }
        const full = path.resolve(file);
        const [song, _created] = await Song.findOrCreate({
            where: { path: full },
            defaults: {
                name: path.basename(full),
                path: full,
            },
        });
        const playList = await PlayList.findByPk(sPlayList.id);
        if (!playList) {
            throw new Error('PlayList not found');
        }
        await playList.addSong(song);
    }

    private checkFile(file: string) {
        return new Promise<boolean>((resolve, _reject) => {
            fs.stat(file, (err, stat) => {
                if (err) {
                    resolve(false);
                } else {
                    resolve(stat.isFile() && SongManager.EXTENSIONS.has(path.extname(file)));
                }
            });
        });
    }

    async getSong(file: string): Promise<SimpleSong | null> {
        const isFile = await this.checkFile(file);
        if (!isFile) {
            return null;
        }
        const full = path.resolve(file);
        const song = await Song.findOne({
            where: { path: full },
        });
        if (!song) {
            return null;
        }
        return {
            id: song.id,
            name: song.name,
            path: song.path,
        };
    }

    async checkSong(song: SimpleSong) {
        const songInstance = await Song.findByPk(song.id);
        if (!songInstance) {
            return false;
        }
        const isFile = await this.checkFile(song.path);
        if (!isFile) {
            return false;
        }
        return true;
    }
}
