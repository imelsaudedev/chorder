'use server';

import { retrieveSong, saveSong } from '@/database/song';
import { SerializedSong, Song } from '@/models/song';
import { RedirectType, redirect } from 'next/navigation';

export type PostSongAction = ((song: SerializedSong) => Promise<void>) & Function;

export const postSong: PostSongAction = async function (serializedSong: SerializedSong) {
  const song = Song.deserialize(serializedSong);
  let savedSong = await saveSong(song);
  redirect(`./${savedSong.slug}`, RedirectType.replace);
};

export type DeleteArrangementAction = ((song: SerializedSong, arrangementId: number) => void) & Function;

export const deleteArrangement: DeleteArrangementAction = async function (
  serializedSong: SerializedSong,
  arrangementId: number
) {
  const song = Song.deserialize(serializedSong);
  song.removeArrangement(arrangementId);
  await saveSong(song);
  redirect(`./`, RedirectType.replace);
};

export async function getSong(slug: string) {
  return retrieveSong(slug);
}
