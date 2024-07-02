import { SerializedSong, SerializedSongArrangement, Song, SongArrangement } from './song';

export class Service {
  title: string;
  slug?: string;
  worshipLeader: string | null;
  date: Date;
  isDeleted: boolean;
  units: ServiceUnit[];

  constructor({
    title,
    slug,
    worshipLeader,
    date,
    isDeleted,
    units,
  }: {
    title?: string;
    slug?: string;
    worshipLeader?: string | null;
    date?: Date;
    isDeleted?: boolean;
    units?: ServiceUnit[];
  }) {
    this.title = title || '';
    this.slug = slug;
    this.worshipLeader = worshipLeader || null;
    this.date = date || new Date();
    this.isDeleted = !!isDeleted;
    this.units = units || [];
  }

  serialize(): SerializedService {
    return {
      title: this.title,
      slug: this.slug,
      worshipLeader: this.worshipLeader,
      date: this.date.toISOString(),
      isDeleted: this.isDeleted,
      units: this.units.map((unit) => unit.serialize()),
    };
  }

  static deserialize(serialized: SerializedService): Service {
    return new Service({
      title: serialized.title,
      slug: serialized.slug,
      worshipLeader: serialized.worshipLeader,
      date: new Date(serialized.date),
      isDeleted: serialized.isDeleted,
      units: serialized.units.map(ServiceUnit.deserialize),
    });
  }

  get isValid() {
    return (this.worshipLeader?.length || 0) > 0 && this.units.length > 0 && this.date instanceof Date;
  }
}

export abstract class ServiceUnit {
  type: 'SONG' | 'TEXT';

  constructor(type: 'SONG' | 'TEXT') {
    this.type = type;
  }

  abstract serialize(): SerializedServiceUnit;

  static deserialize(serialized: SerializedServiceUnit): ServiceUnit {
    switch (serialized.type) {
      case 'SONG':
        return ServiceSongUnit.deserialize(serialized as SerializedSongUnit);
    }
    throw new Error('Unknown service unit type');
  }
}

export class ServiceSongUnit extends ServiceUnit {
  song: Song;
  arrangementId: number;
  arrangement: SongArrangement;
  _semitoneTranspose: number;
  private _originalArrangement: SongArrangement;

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
    this._semitoneTranspose = semitoneTranspose || 0;
    this._originalArrangement = song.getArrangementOrDefault(this.arrangementId)!;
    this._originalArrangement.lock();
    this.arrangement = this._originalArrangement.copy();
    this.arrangement.semitoneTranspose = this.semitoneTranspose;
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

  static deserialize(serialized: SerializedSongUnit): ServiceSongUnit {
    return new ServiceSongUnit({
      song: Song.deserialize(serialized.song),
      arrangementId: serialized.arrangementId,
    });
  }

  get semitoneTranspose() {
    return this._semitoneTranspose;
  }

  set semitoneTranspose(semitones: number) {
    this._semitoneTranspose = semitones;
    this.arrangement.semitoneTranspose = semitones;
  }
}

export type SerializedService = {
  title: string;
  slug: string | undefined;
  worshipLeader: string | null;
  date: string;
  isDeleted: boolean;
  units: SerializedServiceUnit[];
};

export type SerializedServiceUnit = {
  type: 'SONG' | 'TEXT';
};

export type SerializedSongUnit = {
  type: 'SONG';
  song: SerializedSong;
  semitoneTranspose: number;
  arrangementId: number;
  arrangement: SerializedSongArrangement;
};
