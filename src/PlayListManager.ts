import * as fs from 'fs';
import * as path from 'path';
import { Song, PlayList, type SimplePlayList } from './db';
import { Op } from 'sequelize';
import { IgnoreNocturne } from './reflect';

export default class PlayListManager {
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

    loadSongs(dir: string, recursive: boolean) {
        return new Promise<void>(async (resolve, reject) => {
            const isDir = await this.checkDir(dir);
            if (!isDir) {
                reject('Path is not a directory');
            }
            dir = path.resolve(dir);

            const [playList, _created] = await PlayList.findOrCreate({ where: { name: dir } });

            fs.readdir(dir, async (err, files) => {
                if (err) {
                    reject(err);
                }
                try {
                    const songs: Song[] = [];
                    for (const file of files) {
                        const full = path.resolve(dir, file);
                        const isFile = await this.checkFile(full);
                        if (isFile) {
                            const [song, _created] = await Song.findOrCreate({
                                where: { path: full },
                                defaults: {
                                    name: file,
                                    path: full,
                                },
                            });
                            songs.push(song);
                        }
                    }

                    await playList.addSongs(songs);

                    if (recursive) {
                        for (const file of files) {
                            const full = path.resolve(dir, file);
                            const isDir = await this.checkDir(full);
                            if (isDir) {
                                await this.loadSongs(full, recursive);
                            }
                        }
                    }

                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });
    }

    private checkDir(dir: string) {
        return new Promise<boolean>((resolve, _reject) => {
            fs.stat(dir, (err, stat) => {
                if (err) {
                    resolve(false);
                } else {
                    resolve(stat.isDirectory());
                }
            });
        });
    }

    private checkFile(file: string) {
        return new Promise<boolean>((resolve, _reject) => {
            fs.stat(file, (err, stat) => {
                if (err) {
                    resolve(false);
                } else {
                    resolve(stat.isFile() && PlayListManager.EXTENSIONS.has(path.extname(file)));
                }
            });
        });
    }

    async getPlayLists() {
        const playLists = await PlayList.findAll();
        return playLists.map<SimplePlayList>((playList) => {
            return {
                id: playList.id,
                name: playList.name,
            };
        });
    }

    async createPlayList(name: string) {
        const has = await PlayList.findOne({ where: { name } });
        if (has) {
            throw new Error('PlayList already exists');
        }
        const playList = await PlayList.create({ name });
        return {
            id: playList.id,
            name: playList.name,
        } as SimplePlayList;
    }

    async deletePlayList(playList: SimplePlayList) {
        const has = await PlayList.findByPk(playList.id);
        if (has) {
            await has.destroy();
        }
        await this.cleanDB();
    }

    async hasPlayList(name: string) {
        const has = await PlayList.findOne({ where: { name } });
        return !!has;
    }

    async renamePlayList(playListId: number, newName: string) {
        const has = await PlayList.findByPk(playListId);
        if (!has) {
            throw new Error('PlayList not found');
        }
        has.name = newName;
        await has.save();
    }

    async cleanDB() {
        const songs = await Song.findAll({
            include: [
                {
                    model: PlayList,
                    as: 'playLists',
                    attributes: ['id'],
                    required: true,
                },
            ],
        });
        const ids = songs.map((song) => song.id);
        await Song.destroy({
            where: {
                id: {
                    [Op.notIn]: ids,
                },
            },
        });
    }
}
