import { SerializedSong, Song } from './song';
import { SerializedSongArrangement, SongArrangement } from './song-arrangement';
import { SongUnit } from './song-unit';

export type ServiceUnitType = 'SONG' | 'TEXT' | 'DB_SONG';
export const deserializers = new Map<ServiceUnitType, (serialized: SerializedServiceUnit) => ServiceUnit>();

export abstract class ServiceUnit {
  type: ServiceUnitType;

  constructor(type: ServiceUnitType) {
    this.type = type;
  }

  abstract get isValid(): boolean;

  abstract serialize(): SerializedServiceUnit;

  static deserialize(serialized: SerializedServiceUnit): ServiceUnit {
    if (!deserializers.has(serialized.type)) {
      throw new Error('Unknown service unit type');
    }
    return deserializers.get(serialized.type)!(serialized);
  }
}

export class ServiceSongUnit extends ServiceUnit {
  song: Song;
  arrangementId: number;
  semitoneTranspose: number;
  additionalSongUnits: SongUnit[] = [];

  constructor({
    song,
    arrangementId,
    semitoneTranspose,
  }: {
    song: Song;
    arrangementId?: number;
    semitoneTranspose?: number;
  }) {
    super('SONG');
    this.song = song;
    this.arrangementId = arrangementId !== undefined ? arrangementId : song.defaultArrangementId;
    this.semitoneTranspose = semitoneTranspose || 0;
  }

  get isValid() {
    return this.song.isValid;
  }

  serialize(): SerializedSongUnit {
    if (!this.song) {
      throw new Error('Cannot serialize song unit without song');
    }
    if (!this.arrangement) {
      throw new Error('Cannot serialize song unit without arrangement');
    }

    // TODO COPY STUFF FROM ORIGINAL ARRANGEMENT AND ADD NEW UNITS TO THIS SEPARATE UNIT
    return {
      type: 'SONG',
      song: this.song.serialize(),
      semitoneTranspose: this.semitoneTranspose,
      arrangementId: this.arrangementId || this.song.defaultArrangementId,
      arrangement: this.arrangement.serialize(),
    };
  }

  static deserialize(serialized: SerializedServiceUnit): ServiceSongUnit {
    if (serialized.type !== 'SONG') {
      throw new Error('Invalid song unit type');
    }
    const serializedSongUnit = serialized as SerializedSongUnit;
    return new ServiceSongUnit({
      song: Song.deserialize(serializedSongUnit.song),
      arrangementId: serializedSongUnit.arrangementId,
      semitoneTranspose: serializedSongUnit.semitoneTranspose,
    });
  }

  get arrangement() {
    return this.song.arrangements[this.arrangementId];
  }
}
deserializers.set('SONG', ServiceSongUnit.deserialize);

export type SerializedServiceUnit = {
  type: ServiceUnitType;
};

export type SerializedSongUnit = {
  type: 'SONG';
  song: SerializedSong;
  semitoneTranspose: number;
  arrangementId: number;
  arrangement: SerializedSongArrangement;
};
