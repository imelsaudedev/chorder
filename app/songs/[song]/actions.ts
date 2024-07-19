'use server';

import { getChords, getKeyFromChords } from '@/chopro/music';
import { cachedRetrieveSong, retrieveSong, saveSong } from '@/database/song';
import { getDefaultArrangement, NewSong, NewSongArrangement, removeArrangement, Song } from '@/models/song';
import { getArrangementLyrics, getSongUnitMap, SongArrangement } from '@/models/song-arrangement';
import { redirect, RedirectType } from 'next/navigation';

export type PostSongAction = ((song: NewSong) => Promise<void>) & Function;

export const postSong: PostSongAction = async function (incompleteSong: NewSong) {
  const arrangement = incompleteSong.arrangement;
  const slug = incompleteSong.slug;
  if (!arrangement.key || arrangement.key.trim() === '') {
    const allChords = getSongUnitMap(arrangement)
      .map((unit) => getChords(unit.content))
      .flat();
    arrangement.key = getKeyFromChords(allChords) || '';
  }
  let savedSong = await saveSong({
    slug,
    title: incompleteSong.title,
    artist: incompleteSong.artist,
    isDeleted: incompleteSong.isDeleted,
    lyrics: getArrangementLyrics(arrangement),
    arrangement: arrangement as SongArrangement,
    currentArrangementId: incompleteSong.currentArrangementId,
  });
  redirect(`./${savedSong.slug}?arr=${incompleteSong.currentArrangementId}`, RedirectType.replace);
};

export type DeleteArrangementAction = ((song: Song, arrangementId: number) => void) & Function;

export const deleteArrangement: DeleteArrangementAction = async function (incompleteSong: Song, arrangementId: number) {
  const slug = incompleteSong.slug;
  const song = await retrieveSong(slug);
  if (!song) throw new Error('Song not found');

  removeArrangement(song, arrangementId);

  try {
    const arrangement = getDefaultArrangement(song);
    song.lyrics = getArrangementLyrics(arrangement);
  } catch {
    if (!song.isDeleted) {
      if (!song.arrangements || song.arrangements.length === 0)
        throw new Error('Song must have at least one arrangement');
      else throw new Error('Song must have a default arrangement');
    }
  }

  await saveSong(song);
  redirect(`./`, RedirectType.replace);
};

export async function getSongOrCreate(
  slug: string | undefined,
  currentArrangementId: number | undefined
): Promise<NewSong> {
  const fullSong = (slug && slug !== 'new' && (await cachedRetrieveSong(slug))) || null;
  let arrangement: NewSongArrangement = {
    units: [],
    songMap: [],
    isDefault: true,
    isDeleted: false,
    lastUnitId: 0,
    semitoneTranspose: 0,
    isNew: true,
  };
  if (fullSong) {
    if (fullSong.arrangements.length === 0) {
      currentArrangementId = 0;
    } else {
      if (currentArrangementId === undefined || !fullSong.arrangements[currentArrangementId]) {
        currentArrangementId = fullSong.arrangements.findIndex((arrangement) => arrangement.isDefault);
        if (!fullSong.arrangements[currentArrangementId]) {
          currentArrangementId = fullSong.arrangements.findIndex((arrangement) => !arrangement.isDeleted);
          if (currentArrangementId === -1) {
            currentArrangementId = 0;
          }
          fullSong.arrangements[currentArrangementId].isDefault = true;
        }
      }
      if (fullSong.arrangements[currentArrangementId]) {
        arrangement = { ...fullSong.arrangements[currentArrangementId], isNew: false };
      }
    }
    return {
      title: fullSong.title,
      slug: fullSong.slug,
      artist: fullSong.artist,
      arrangements: fullSong.arrangements.map((arrangement) => ({ ...arrangement, isNew: false })),
      isDeleted: fullSong.isDeleted,
      currentArrangementId,
      arrangement,
    };
  }
  return {
    title: '',
    artist: null,
    arrangements: [arrangement],
    isDeleted: false,
    currentArrangementId: 0,
    arrangement,
  };
}

export type MoveArrangementAction = ((
  previousSongSlug: string,
  arrangementId: number,
  newSongSlug: string
) => Promise<void>) &
  Function;

export const moveArrangement: MoveArrangementAction = async function (
  previousSongSlug: string,
  arrangementId: number,
  newSongSlug: string
) {
  const previousSong = await retrieveSong(previousSongSlug);
  const song = await retrieveSong(newSongSlug);
  if (!song || !previousSong) throw new Error('Song not found');

  const newArrangement: SongArrangement = {
    ...previousSong.arrangements[arrangementId],
    isDefault: false,
    isDeleted: false,
  };

  song.arrangements.push(newArrangement);
  await saveSong(song);

  removeArrangement(previousSong, arrangementId);
  await saveSong(previousSong);

  redirect(`./${song.slug}?arr=${song.arrangements.length - 1}`, RedirectType.replace);
};

export type MakeArrangementDefaultAction = ((songSlug: string, arrangementId: number) => Promise<void>) & Function;

export const makeArrangementDefault: MakeArrangementDefaultAction = async function (
  songSlug: string,
  arrangementId: number
) {
  const song = await retrieveSong(songSlug);
  if (!song) throw new Error('Song not found');
  if (arrangementId < 0 || arrangementId >= song.arrangements.length || song.arrangements[arrangementId].isDeleted)
    throw new Error('Arrangement not found');

  song.arrangements.forEach((arrangement, index) => {
    arrangement.isDefault = index === arrangementId;
  });

  await saveSong(song);
};
