import { SerializedSongUnit, SongUnit } from './song-unit';
import { getChords, getKeyFromChords, getLyrics, transposeChord } from '@/chopro/music';

export class Song {
  title: string;
  slug?: string;
  artist: string | null;
  isDeleted: boolean;
  arrangements: SongArrangement[];

  constructor({
    title,
    slug,
    artist,
    arrangements,
    isDeleted,
  }: {
    title?: string;
    slug?: string;
    artist?: string | null;
    arrangements?: SongArrangement[];
    isDeleted?: boolean;
  }) {
    this.title = title || '';
    this.slug = slug;
    this.artist = artist || null;
    this.arrangements = arrangements || [];
    this.isDeleted = isDeleted || false;
  }

  get lyrics() {
    return this.defaultArrangement?.lyrics || '';
  }

  get defaultArrangementId() {
    return this.arrangements.findIndex((arrangement) => arrangement.isDefault);
  }

  get defaultArrangement() {
    return this.arrangements[this.defaultArrangementId];
  }

  serialize(): SerializedSong {
    return {
      title: this.title,
      slug: this.slug || '',
      artist: this.artist,
      lyrics: this.lyrics,
      arrangements: this.arrangements.map((arrangement) => arrangement.serialize()),
      isDeleted: this.isDeleted,
    };
  }

  static deserialize(serialized: SerializedSong): Song {
    return new Song({
      ...serialized,
      arrangements: serialized.arrangements.map((arrangement) => SongArrangement.deserialize(arrangement)),
    });
  }

  getArrangementOrDefault(arrangementId: number | null): SongArrangement | undefined {
    if (arrangementId === null || arrangementId < 0 || arrangementId >= this.arrangements.length) {
      return this.defaultArrangement;
    }
    return this.arrangements[arrangementId];
  }

  removeArrangement(arrangementId: number) {
    const arrangement = this.arrangements[arrangementId];
    if (!arrangement) return;
    arrangement.isDeleted = true;
    if (arrangement.isDefault) {
      arrangement.isDefault = false;
      const newDefault = this.arrangements.find((arrangement) => !arrangement.isDeleted);
      if (newDefault) {
        newDefault.isDefault = true;
      } else {
        this.isDeleted = true;
      }
    }
  }
}

export class SongArrangement {
  private _key: string | undefined;
  private _units: SongUnit[];
  private _songMap: number[];
  private _isDeleted: boolean;
  private _isDefault: boolean;
  private _lastUnitId: number;
  private _locked: boolean;

  constructor({
    key,
    units,
    songMap,
    isDefault,
    isDeleted,
    lastUnitId,
    locked,
  }: {
    key?: string;
    units?: SongUnit[];
    songMap?: number[];
    isDefault?: boolean;
    isDeleted?: boolean;
    lastUnitId?: number;
    locked?: boolean;
  }) {
    this._key = key || '';
    this._units = units || [];
    this._songMap = songMap || [];
    this._isDefault = isDefault || false;
    this._isDeleted = isDeleted || false;
    this._lastUnitId = lastUnitId || 0;
    this._locked = !!locked;
  }

  copy() {
    return SongArrangement.deserialize(this.serialize());
  }

  serialize(): SerializedSongArrangement {
    return {
      key: this.key,
      units: this.units.map((unit) => unit.serialize()),
      songMap: this.songMap,
      isDefault: this.isDefault,
      isDeleted: this.isDeleted,
      lastUnitId: this.lastUnitId,
    };
  }

  static deserialize(serialized: SerializedSongArrangement): SongArrangement {
    const units = serialized.units.map((unit) => SongUnit.deserialize(unit));
    return new SongArrangement({
      ...serialized,
      units,
    });
  }

  set key(newKey: string) {
    if (this._locked) throw new Error('Cannot modify locked song arrangement');
    this._key = newKey;
  }

  get key() {
    if (!this._key) {
      const allChords = this.units.map((unit) => getChords(unit.content)).flat();
      this._key = getKeyFromChords(allChords) || '';
    }
    return this._key;
  }

  get rawKey() {
    return this._key;
  }

  get transpositionKeys(): [string, number][] {
    const key = this.key;
    if (!key) return [];

    return Array.from(Array(12).keys()).map((i) => {
      const semitones = i - 5;
      return [transposeChord(key, key, semitones), semitones];
    });
  }

  get units() {
    return this._units;
  }

  set units(newValue) {
    if (this._locked) throw new Error('Cannot modify locked song arrangement');
    this._units = newValue;
  }

  get songMap() {
    return this._songMap;
  }

  set songMap(newValue) {
    if (this._locked) throw new Error('Cannot modify locked song arrangement');
    this._songMap = newValue;
  }

  get songUnitMap() {
    return this.songMap
      .map((songUnitId) => this.units.find((unit) => unit.internalId === songUnitId))
      .filter(Boolean) as SongUnit[];
  }

  get isDefault() {
    return this._isDefault;
  }

  set isDefault(newValue) {
    if (this._locked) throw new Error('Cannot modify locked song arrangement');
    this._isDefault = newValue;
  }

  get isDeleted() {
    return this._isDeleted;
  }

  set isDeleted(newValue) {
    if (this._locked) throw new Error('Cannot modify locked song arrangement');
    this._isDeleted = newValue;
  }

  get lastUnitId() {
    return this._lastUnitId;
  }

  set lastUnitId(newValue) {
    if (this._locked) throw new Error('Cannot modify locked song arrangement');
    this._lastUnitId = newValue;
  }

  get lyrics() {
    return this.units.map((unit) => unit.lyrics).join('\n');
  }

  lock() {
    this._locked = true;
    for (const unit of this.units) {
      unit.lock();
    }
  }

  unlock() {
    this._locked = false;
    for (const unit of this.units) {
      unit.unlock();
    }
  }
}

export type SerializedSong = {
  title: string;
  slug: string;
  artist: string | null;
  lyrics: string;
  arrangements: SerializedSongArrangement[];
  isDeleted: boolean;
};

export type SerializedSongArrangement = {
  key: string;
  units: SerializedSongUnit[];
  songMap: number[];
  isDefault: boolean;
  isDeleted: boolean;
  lastUnitId: number;
};

export function groupSongsByFirstLetter(songs: Song[]): Map<string, Song[]> {
  const byFirstLetter = new Map<string, Song[]>();

  songs.forEach((song) => {
    const firstLetter = song.title
      .trim()
      .charAt(0)
      .toLowerCase()
      .normalize('NFKD')
      .replace(/\p{Diacritic}/gu, '');
    let letterGroup = byFirstLetter.get(firstLetter);
    if (!letterGroup) {
      letterGroup = [];
      byFirstLetter.set(firstLetter, letterGroup);
    }

    letterGroup.push(song);
  });

  return byFirstLetter;
}
