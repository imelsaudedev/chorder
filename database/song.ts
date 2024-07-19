import { my_unstable_cache } from '@/lib/my_unstable_cache';
import { NewSong, Song } from '@/models/song';
import { SongArrangement } from '@/models/song-arrangement';
import { Filter } from 'mongodb';
import { revalidateTag } from 'next/cache';
import { DBData, getDB } from './client';
import { getAvailableSlug, saveSlug } from './slug';

export const SONGS_CACHE_TAG = 'songs';

type RetrieveSongOptions = {
  acceptDeleted?: boolean;
};
export function retrieveSongs({
  filter,
  options,
  dbData,
}: {
  filter?: Filter<Song>;
  options?: RetrieveSongOptions;
  dbData?: DBData;
}): Promise<Song[]> {
  const combinedFilter = filter || {};
  if (!options?.acceptDeleted) {
    combinedFilter['isDeleted'] = false;
  }
  return getSongsCollection(dbData).then(({ songs: songCollection }) =>
    songCollection
      .find(combinedFilter)
      .toArray()
      .then((songs) => {
        return songs.map((song) => {
          delete (song as any)._id;
          return song;
        });
      })
  );
}
export const cachedRetrieveSongs = my_unstable_cache(retrieveSongs, ['song-list'], { tags: [SONGS_CACHE_TAG] });

export function retrieveSongsBySlug(
  slugs: string[],
  { options, dbData }: { options?: RetrieveSongOptions; dbData?: DBData }
): Promise<Song[]> {
  return retrieveSongs({ filter: { slug: { $in: slugs } }, options, dbData });
}
export const cachedRetrieveSongsBySlug = my_unstable_cache(retrieveSongsBySlug, ['songs-by-slug'], {
  tags: [SONGS_CACHE_TAG],
});

export function retrieveSong(slug: string, dbData?: DBData): Promise<Song | null> {
  return getSongsCollection(dbData).then(({ songs }) => {
    return songs.findOne({ slug, isDeleted: false }).then((serializedSong) => {
      if (serializedSong) {
        return serializedSong;
      } else {
        return null;
      }
    });
  });
}
export const cachedRetrieveSong = my_unstable_cache(retrieveSong, ['song'], { tags: [SONGS_CACHE_TAG] });

export async function saveSong(
  {
    title,
    slug,
    artist,
    lyrics,
    isDeleted,
    arrangement,
    arrangements,
    currentArrangementId,
  }: {
    title?: string;
    slug?: string;
    artist?: string | null;
    lyrics?: string;
    isDeleted?: boolean;
    arrangement?: SongArrangement;
    arrangements?: SongArrangement[];
    currentArrangementId?: number;
  },
  dbData?: DBData
): Promise<Song> {
  const { client, db, songs } = await getSongsCollection(dbData);
  const song = (slug && (await retrieveSong(slug, { client, db }))) || ({} as NewSong);
  if (title !== undefined) song.title = title;
  if (artist !== undefined) song.artist = artist;
  if (lyrics !== undefined) song.lyrics = lyrics;
  if (isDeleted !== undefined) song.isDeleted = isDeleted;
  if (arrangements !== undefined) song.arrangements = arrangements;
  if (arrangement !== undefined) {
    if (currentArrangementId !== undefined) {
      if (!song.arrangements) song.arrangements = [];
      song.arrangements[currentArrangementId] = arrangement;
    } else {
      throw new Error('currentArrangementId must be defined when updating arrangement');
    }
  }

  if (slug) {
    try {
      await songs.updateOne({ slug: song.slug }, { $set: song as Song });
    } catch (e) {
      console.error(e, `\nFailed with song ${JSON.stringify(song, null, 2)}`);
      throw new Error('Failed to update song');
    }
  } else {
    const slug = await getAvailableSlug(song.title, dbData);
    song.slug = slug;

    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        await songs.insertOne(song as Song);
        await saveSlug(slug);
      });
    } catch (e) {
      console.error(e, `\nFailed with song ${JSON.stringify(song, null, 2)}`);
      throw new Error('Failed to save song');
    } finally {
      await session.endSession();
      await client.close();
    }
  }
  revalidateTag(SONGS_CACHE_TAG);
  return song as Song;
}

export async function getSongsCollection(dbData?: DBData) {
  const { client, db } = await getDB(dbData);
  return { client, db, songs: db.collection<Song>('songs') };
}
