import {
    Sequelize,
    DataTypes,
    Model,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    BelongsToManyAddAssociationMixin,
    BelongsToManyAddAssociationsMixin,
    BelongsToManyCountAssociationsMixin,
    BelongsToManyCreateAssociationMixin,
    BelongsToManyGetAssociationsMixin,
    BelongsToManyHasAssociationMixin,
    BelongsToManyHasAssociationsMixin,
    BelongsToManyRemoveAssociationMixin,
    BelongsToManyRemoveAssociationsMixin,
    BelongsToManySetAssociationsMixin,
    NonAttribute,
    Association,
} from 'sequelize';

const db = new Sequelize({
    dialect: 'sqlite',
    storage: 'local/nocturne.sqlite',
});

class Song extends Model<InferAttributes<Song, { omit: 'playLists' }>, InferCreationAttributes<Song>> {
    declare id: CreationOptional<number>;
    declare name: string;
    declare path: string;

    declare addPlayList: BelongsToManyAddAssociationMixin<PlayList, number>;
    declare addPlayLists: BelongsToManyAddAssociationsMixin<PlayList, number>;
    declare countPlayLists: BelongsToManyCountAssociationsMixin;
    declare createPlayList: BelongsToManyCreateAssociationMixin<PlayList>;
    declare getPlayLists: BelongsToManyGetAssociationsMixin<PlayList>;
    declare hasPlayList: BelongsToManyHasAssociationMixin<PlayList, number>;
    declare hasPlayLists: BelongsToManyHasAssociationsMixin<PlayList, number>;
    declare removePlayList: BelongsToManyRemoveAssociationMixin<PlayList, number>;
    declare removePlayLists: BelongsToManyRemoveAssociationsMixin<PlayList, number>;
    declare setPlayLists: BelongsToManySetAssociationsMixin<PlayList, number>;

    declare playLists?: NonAttribute<PlayList[]>;

    declare static associations: {
        playLists: Association<Song, PlayList>;
    };
}

interface SimpleSong {
    id: number;
    name: string;
    path: string;
}

class PlayList extends Model<InferAttributes<PlayList, { omit: 'songs' }>, InferCreationAttributes<PlayList>> {
    declare id: CreationOptional<number>;
    declare name: string;

    declare addSong: BelongsToManyAddAssociationMixin<Song, number>;
    declare addSongs: BelongsToManyAddAssociationsMixin<Song, number>;
    declare countSongs: BelongsToManyCountAssociationsMixin;
    declare createSong: BelongsToManyCreateAssociationMixin<Song>;
    declare getSongs: BelongsToManyGetAssociationsMixin<Song>;
    declare hasSong: BelongsToManyHasAssociationMixin<Song, number>;
    declare hasSongs: BelongsToManyHasAssociationsMixin<Song, number>;
    declare removeSong: BelongsToManyRemoveAssociationMixin<Song, number>;
    declare removeSongs: BelongsToManyRemoveAssociationsMixin<Song, number>;
    declare setSongs: BelongsToManySetAssociationsMixin<Song, number>;

    declare songs?: NonAttribute<Song[]>;

    declare static associations: {
        songs: Association<PlayList, Song>;
    };
}

interface SimplePlayList {
    id: number;
    name: string;
}

Song.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: DataTypes.STRING,
        path: {
            type: DataTypes.STRING,
            unique: true,
        },
    },
    {
        sequelize: db,
    }
);

PlayList.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            unique: true,
        },
    },
    {
        sequelize: db,
    }
);

Song.belongsToMany(PlayList, { as: 'playLists', through: 'SongPlayList' });
PlayList.belongsToMany(Song, { as: 'songs', through: 'SongPlayList' });

declare const SongSymbol: unique symbol;
declare const PlayListSymbol: unique symbol;

declare namespace models {
    export type Song = SimpleSong;
    export type PlayList = SimplePlayList;
}

export { db, Song, PlayList, type SimpleSong, type SimplePlayList, type models };
