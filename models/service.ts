import { Song, SongArrangement } from './song';

export class Service {
  title?: string;
  slug?: string;
  isDeleted: boolean;
  units: ServiceUnit[];

  constructor() {
    this.isDeleted = false;
    this.units = [];
  }
}

export abstract class ServiceUnit {
  type: 'SONG' | 'TEXT';

  constructor(type: 'SONG' | 'TEXT') {
    this.type = type;
  }
}

export class ServiceSongUnit extends ServiceUnit {
  song: Song;
  arrangementId: number;
  arrangement: SongArrangement;
  private _originalArrangement: SongArrangement;

  constructor(song: Song, arrangementId: number) {
    super('SONG');
    this.song = song;
    this.arrangementId = arrangementId;
    this._originalArrangement = song.getArrangementOrDefault(arrangementId)!;
    this._originalArrangement.lock();
    this.arrangement = this._originalArrangement.copy();
  }
}
