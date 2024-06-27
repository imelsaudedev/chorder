import { SerializedSongUnit, SongUnit } from "./song-unit";
import { getChords, getKeyFromChords, getLyrics } from "@/chopro/music";

export class Song {
  title: string;
  slug?: string;
  artist: string | null;
  isDeleted: boolean;
  arrangements: SongArrangement[];

  constructor({ title, slug, artist, arrangements, isDeleted }: { title?: string, slug?: string, artist?: string | null, arrangements?: SongArrangement[], isDeleted?: boolean }) {
    this.title = title || "";
    this.slug = slug;
    this.artist = artist || null;
    this.arrangements = arrangements || [];
    this.isDeleted = isDeleted || false;
  }

  get lyrics() {
    return this.defaultArrangement?.units.map((unit) => getLyrics(unit.content) || "").join("\n") || "";
  }

  get defaultArrangement() {
    return this.arrangements.find((arrangement) => arrangement.isDefault);
  }

  serialize(): SerializedSong {
    return {
      title: this.title,
      slug: this.slug || "",
      artist: this.artist,
      lyrics: this.lyrics,
      arrangements: this.arrangements.map((arrangement) => arrangement.serialize()),
      isDeleted: this.isDeleted,
    };
  }

  static deserialize(serialized: SerializedSong): Song {
    return new Song({
      ...serialized,
      arrangements: serialized.arrangements.map((arrangement) => SongArrangement.deserialize(arrangement))
    });
  }

  getArrangementOrDefault(arrangementId: number | null): SongArrangement | undefined {
    if (arrangementId === null) {
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
};

export class SongArrangement {
  private _key: string | undefined;
  units: SongUnit[];
  songMap: number[];
  isDeleted: boolean;
  isDefault: boolean;
  lastUnitId: number;

  constructor({ key, units, songMap, isDefault, isDeleted, lastUnitId }: { key?: string, units?: SongUnit[], songMap?: number[], isDefault?: boolean, isDeleted?: boolean, lastUnitId?: number }) {
    this._key = key || "";
    this.units = units || [];
    this.songMap = songMap || [];
    this.isDefault = isDefault || false;
    this.isDeleted = isDeleted || false;
    this.lastUnitId = lastUnitId || 0;
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
      units
    });
  }

  set key(newKey: string) {
    this._key = newKey;
  }

  get key() {
    if (!this._key) {
      const allChords = this.units.map((unit) => getChords(unit.content)).flat();
      this._key = getKeyFromChords(allChords) || "";
    }
    return this._key;
  }

  get rawKey() {
    return this._key;
  }

  swapUnits(index1: number, index2: number) {
    const temp = this.units[index1];
    this.units[index1] = this.units[index2];
    this.units[index2] = temp;
  }
};

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
    const firstLetter = song.title.trim().charAt(0).toLowerCase().normalize("NFKD").replace(/\p{Diacritic}/gu, "");
    let letterGroup = byFirstLetter.get(firstLetter);
    if (!letterGroup) {
      letterGroup = [];
      byFirstLetter.set(firstLetter, letterGroup);
    }

    letterGroup.push(song);
  });

  return byFirstLetter;
}
