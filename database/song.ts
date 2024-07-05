import { RequiredArrangements, RequiredLyrics, RequiredSlug, Song, SongWith } from '@/models/song';
import { DBData, getDB } from './client';
import { getAvailableSlug, saveSlug } from './slug';
import { Filter } from 'mongodb';

type DBSong = SongWith<RequiredArrangements & RequiredLyrics>;
type PersistedDBSong = SongWith<RequiredArrangements & RequiredLyrics & RequiredSlug>;

type RetrieveSongOptions = {
  acceptDeleted?: boolean;
};
export function retrieveSongs({
  filter,
  options,
  dbData,
}: {
  filter?: Filter<PersistedDBSong>;
  options?: RetrieveSongOptions;
  dbData?: DBData;
}): Promise<Song[]> {
  const combinedFilter = filter || {};
  if (!options?.acceptDeleted) {
    combinedFilter['isDeleted'] = false;
  }
  return getSongsCollection(dbData).then(({ songs }) => {
    return songs.find(combinedFilter).toArray();
  });
}

export function retrieveSongsBySlug(
  slugs: string[],
  { options, dbData }: { options?: RetrieveSongOptions; dbData?: DBData }
): Promise<Song[]> {
  return retrieveSongs({ filter: { slug: { $in: slugs } }, options, dbData });
}

export function retrieveSong(slug: string, dbData?: DBData): Promise<PersistedDBSong | null> {
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

export async function saveSong(song: DBSong, dbData?: DBData): Promise<PersistedDBSong> {
  const { client, songs } = await getSongsCollection(dbData);
  if (song.slug) {
    try {
      await songs.updateOne({ slug: song.slug }, { $set: song });
    } catch (e) {
      console.error(e, `\nFailed with song ${JSON.stringify(song)}`);
      throw new Error('Failed to update song');
    }
  } else {
    const slug = await getAvailableSlug(song.title, dbData);
    song.slug = slug;

    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        await songs.insertOne(song as PersistedDBSong);
        await saveSlug(slug);
      });
    } catch (e) {
      console.error(e, `\nFailed with song ${JSON.stringify(song)}`);
      throw new Error('Failed to save song');
    } finally {
      await session.endSession();
      await client.close();
    }
  }
  return song as PersistedDBSong;
}

export async function getSongsCollection(dbData?: DBData) {
  const { client, db } = await getDB(dbData);
  return { client, songs: db.collection<PersistedDBSong>('songs') };
}
