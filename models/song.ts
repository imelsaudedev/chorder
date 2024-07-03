import { SerializedSongArrangement, SongArrangement } from './song-arrangement';

export class Song {
  title: string;
  slug?: string;
  artist: string | null;
  isDeleted: boolean;
  arrangements: SongArrangement[];
  currentArrangementId?: number;

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

  get currentArrangement(): SongArrangement | undefined {
    if (
      this.currentArrangementId === undefined ||
      this.currentArrangementId < 0 ||
      this.currentArrangementId >= this.arrangements.length
    ) {
      this.currentArrangementId = this.defaultArrangementId;
      return this.defaultArrangement;
    }
    return this.arrangements[this.currentArrangementId];
  }

  get isValid() {
    return this.title.trim().length > 0 && this.arrangements.length > 0 && !!this.currentArrangement?.isValid;
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

  createArrangement() {
    const newArrangement = new SongArrangement({});
    if (this.arrangements.length === 0) {
      newArrangement.isDefault = true;
      newArrangement.isNew = true;
    }
    this.arrangements.push(newArrangement);
    this.currentArrangementId = this.arrangements.length - 1;
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

  getOrCreateCurrentArrangement() {
    if (!this.currentArrangement) {
      this.createArrangement();
    }
    return this.currentArrangement!;
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

export function mapSongsBySlug(songs: Song[]): Map<string, Song> {
  return songs.reduce((acc, song) => {
    acc.set(song.slug!, song);
    return acc;
  }, new Map<string, Song>());
}
