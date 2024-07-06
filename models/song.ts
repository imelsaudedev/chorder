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

export function mapSongsBySlug<T extends SongWith<RequiredSlug>>(songs: T[]): Map<string, T> {
  return songs.reduce((acc, song) => {
    acc.set(song.slug, song);
    return acc;
  }, new Map<string, T>());
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
  const defaultArrangementId = getDefaultArrangementId(song);
  if (defaultArrangementId === -1) throw new Error('No default arrangement found');
  return song.arrangements[defaultArrangementId];
}

export function getDefaultArrangementId(song: SongWith<RequiredArrangements>) {
  return song.arrangements.findIndex((arrangement) => arrangement.isDefault);
}

export function setArrangement<T extends SongWith<RequiredArrangements>>(song: T): SongWith<T & RequiredArrangement> {
  let arrangement;
  if (song.currentArrangementId === undefined) {
    song.currentArrangementId = getDefaultArrangementId(song);
  }
  arrangement = song.arrangements[song.currentArrangementId];
  if (!arrangement) {
    arrangement = song.arrangements[0];
  }
  return {
    ...song,
    currentArrangementId: song.currentArrangementId,
    arrangement: arrangement as SongArrangement,
  };
}
