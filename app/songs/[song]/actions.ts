'use server';

import { getChords, getKeyFromChords } from '@/chopro/music';
import { retrieveSong, saveSong } from '@/database/song';
import {
  getDefaultArrangement,
  removeArrangement,
  RequiredArrangement,
  RequiredArrangements,
  RequiredLyrics,
  RequiredSlug,
  Song,
  SongWith,
} from '@/models/song';
import { getArrangementLyrics, getSongUnitMap, RequiredIsNew, SongArrangementWith } from '@/models/song-arrangement';
import { redirect, RedirectType } from 'next/navigation';

export type PostSongAction = ((song: SongWith<RequiredArrangement>) => Promise<void>) & Function;

export const postSong: PostSongAction = async function (incompleteSong: SongWith<RequiredArrangement>) {
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
    arrangement: arrangement,
    currentArrangementId: incompleteSong.currentArrangementId,
  });
  redirect(`./${savedSong.slug}`, RedirectType.replace);
};

export type DeleteArrangementAction = ((song: SongWith<RequiredSlug>, arrangementId: number) => void) & Function;

export const deleteArrangement: DeleteArrangementAction = async function (
  incompleteSong: SongWith<RequiredSlug>,
  arrangementId: number
) {
  const slug = incompleteSong.slug;
  const song = await retrieveSong(slug);
  if (!song) throw new Error('Song not found');

  removeArrangement(song as SongWith<RequiredArrangements>, arrangementId);

  const arrangement = getDefaultArrangement(song as SongWith<RequiredArrangements>);
  if (arrangement) {
    song.lyrics = getArrangementLyrics(arrangement);
  } else if (!song.isDeleted) {
    if (!song.arrangements || song.arrangements.length === 0)
      throw new Error('Song must have at least one arrangement');
    else throw new Error('Song must have a default arrangement');
  }

  await saveSong(song as SongWith<RequiredArrangements & RequiredLyrics>);
  redirect(`./`, RedirectType.replace);
};

export async function getSongOrCreate(
  slug: string | undefined,
  currentArrangementId: number | undefined
): Promise<SongWith<RequiredArrangement<SongArrangementWith<RequiredIsNew>>>> {
  const fullSong = (slug && slug !== 'new' && (await retrieveSong(slug))) || null;
  let arrangement: SongArrangementWith<RequiredIsNew> = {
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
      slug: fullSong.slug!,
      artist: fullSong.artist,
      isDeleted: fullSong.isDeleted,
      currentArrangementId,
      arrangement,
    };
  }
  return {
    title: '',
    artist: null,
    isDeleted: false,
    currentArrangementId: 0,
    arrangement,
  };
}
