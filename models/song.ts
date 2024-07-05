import { SongArrangement } from './song-arrangement';

export type Song<ArrangementType = SongArrangement> = {
  title: string;
  slug?: string;
  artist: string | null;
  lyrics?: string;
  isDeleted: boolean;
  arrangement?: ArrangementType;
  arrangements?: ArrangementType[];
  currentArrangementId?: number;
};

export type SongWith<T> = Omit<Song, keyof T> & T;

export type RequiredSlug = {
  slug: string;
};

export type RequiredLyrics = {
  lyrics: string;
};

export type RequiredArrangement<ArrangementType = SongArrangement> = {
  arrangement: ArrangementType;
  currentArrangementId: number;
};

export type RequiredArrangements<ArrangementType = SongArrangement> = {
  arrangements: ArrangementType[];
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

export function removeArrangement(song: SongWith<RequiredArrangements>, arrangementId: number) {
  const arrangement = song.arrangements[arrangementId];
  if (!arrangement) return;
  arrangement.isDeleted = true;
  if (arrangement.isDefault) {
    arrangement.isDefault = false;
    const newDefault = song.arrangements.find((arrangement) => !arrangement.isDeleted);
    if (newDefault) {
      newDefault.isDefault = true;
    } else {
      song.isDeleted = true;
    }
  }
}

export function getDefaultArrangement(song: SongWith<RequiredArrangements>) {
  return song.arrangements.find((arrangement) => arrangement.isDefault);
}
