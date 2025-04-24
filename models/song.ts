import {
  OptionalKey,
  RequiredIsNew,
  SongArrangement,
  SongArrangementWith,
} from "./song-arrangement";

export type Song<ArrangementType = SongArrangement> = {
  title: string;
  slug: string;
  artist: string | null;
  lyrics: string;
  isDeleted: boolean;
  arrangement?: ArrangementType;
  arrangements: ArrangementType[];
  currentArrangementId?: number;
};

export type SongWith<T, ArrangementType = SongArrangement> = Omit<
  Song<ArrangementType>,
  keyof T
> &
  T;

export type OptionalSlug = {
  slug?: string;
};

export type OptionalLyrics = {
  lyrics?: string;
};

export type RequiredArrangement<ArrangementType = SongArrangement> = {
  arrangement: ArrangementType;
  currentArrangementId: number;
};

export type WithoutArrangements<T extends Song> = Omit<
  T,
  "arrangements" | "arrangement" | "currentArrangementId"
>;

export type NewSongArrangement = SongArrangementWith<
  OptionalKey & RequiredIsNew
>;
export type NewSong = SongWith<
  OptionalSlug & OptionalLyrics & RequiredArrangement<NewSongArrangement>,
  NewSongArrangement
>;

export function groupSongsByFirstLetter<T extends { title: string }>(
  songs: T[]
): Map<string, T[]> {
  const byFirstLetter = new Map<string, T[]>();

  songs.forEach((song) => {
    const firstLetter = song.title
      .trim()
      .charAt(0)
      .toLowerCase()
      .normalize("NFKD")
      .replace(/\p{Diacritic}/gu, "");
    let letterGroup = byFirstLetter.get(firstLetter);
    if (!letterGroup) {
      letterGroup = [];
      byFirstLetter.set(firstLetter, letterGroup);
    }

    letterGroup.push(song);
  });

  return byFirstLetter;
}

export function mapSongsBySlug<T extends Song>(songs: T[]): Map<string, T> {
  return songs.reduce((acc, song) => {
    acc.set(song.slug, song);
    return acc;
  }, new Map<string, T>());
}

export function removeArrangement(song: Song, arrangementId: number) {
  const arrangement = song.arrangements[arrangementId];
  if (!arrangement) return;
  arrangement.isDeleted = true;
  if (arrangement.isDefault) {
    arrangement.isDefault = false;
    const newDefault = song.arrangements.find(
      (arrangement) => !arrangement.isDeleted
    );
    if (newDefault) {
      newDefault.isDefault = true;
    } else {
      song.isDeleted = true;
    }
  }
}

export function getDefaultArrangement(song: Song) {
  const defaultArrangementId = getDefaultArrangementId(song);
  if (defaultArrangementId === -1)
    throw new Error("No default arrangement found");
  return song.arrangements[defaultArrangementId];
}

export function getDefaultArrangementId(song: Song) {
  return song.arrangements.findIndex((arrangement) => arrangement.isDefault);
}

export function setArrangement<T extends Song>(
  song: T
): SongWith<T & RequiredArrangement> {
  let arrangement;
  if (song.currentArrangementId === undefined) {
    song.currentArrangementId = getDefaultArrangementId(song);
  }
  arrangement = song.arrangements[song.currentArrangementId];
  if (!arrangement) {
    throw new Error(`Invalid arrangementId: ${song.currentArrangementId}`);
  }
  return {
    ...song,
    currentArrangementId: song.currentArrangementId,
    arrangement: arrangement as SongArrangement,
  };
}

export function excludeArrangements<T extends Song>(
  song: T
): WithoutArrangements<T> {
  const { arrangements, arrangement, currentArrangementId, ...remaining } =
    song;
  return remaining;
}
