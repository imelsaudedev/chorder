import { Song, SongArrangement } from './song';

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
    worshipLeader: string | null;
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
}

export abstract class ServiceUnit {
  type: 'SONG' | 'TEXT';

  constructor(type: 'SONG' | 'TEXT') {
    this.type = type;
  }
}

export class ServiceSongUnit extends ServiceUnit {
  song?: Song;
  arrangementId?: number;
  arrangement?: SongArrangement;
  private _originalArrangement?: SongArrangement;

  constructor({ song, arrangementId }: { song?: Song; arrangementId?: number }) {
    super('SONG');
    this.song = song;
    this.arrangementId = arrangementId;
    this._originalArrangement = (song && arrangementId !== undefined) ? song.getArrangementOrDefault(arrangementId) : undefined;
    this._originalArrangement?.lock();
    this.arrangement = this._originalArrangement?.copy();
  }
}
