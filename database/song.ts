import { SerializedSong, Song } from '@/models/song';
import { DBData, getDB } from './client';
import { getAvailableSlug, saveSlug } from './slug';
import { Filter } from 'mongodb';

type RetrieveSongOptions = {
  acceptDeleted?: boolean;
};
export function retrieveSongs({
  filter,
  options,
  dbData,
}: {
  filter?: Filter<SerializedSong>;
  options?: RetrieveSongOptions;
  dbData?: DBData;
}): Promise<Song[]> {
  const combinedFilter = filter || {};
  if (!options?.acceptDeleted) {
    combinedFilter['isDeleted'] = false;
  }
  return getSongsCollection(dbData).then(({ songs }) => {
    return songs
      .find(combinedFilter)
      .toArray()
      .then((serializedSongs) => {
        return serializedSongs.map(Song.deserialize);
      });
  });
}

export function retrieveSongsBySlug(
  slugs: string[],
  { options, dbData }: { options?: RetrieveSongOptions; dbData?: DBData }
): Promise<Song[]> {
  return retrieveSongs({ filter: { slug: { $in: slugs } }, options, dbData });
}

export function retrieveSong(slug: string, dbData?: DBData): Promise<Song | null> {
  return getSongsCollection(dbData).then(({ songs }) => {
    return songs.findOne({ slug, isDeleted: false }).then((serializedSong) => {
      if (serializedSong) {
        return Song.deserialize(serializedSong);
      } else {
        return null;
      }
    });
  });
}

export async function saveSong(song: Song, dbData?: DBData): Promise<Song> {
  const { client, songs } = await getSongsCollection(dbData);
  if (song.slug) {
    await songs.updateOne({ slug: song.slug }, { $set: song.serialize() });
  } else {
    const slug = await getAvailableSlug(song.title, dbData);
    song.slug = slug;

    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        await songs.insertOne(song.serialize());
        await saveSlug(slug);
      });
    } finally {
      await session.endSession();
      await client.close();
    }
  }
  return song;
}

export async function getSongsCollection(dbData?: DBData) {
  const { client, db } = await getDB(dbData);
  return { client, songs: db.collection<SerializedSong>('songs') };
}
