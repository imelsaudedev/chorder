import { RequiredArrangements, RequiredLyrics, RequiredSlug, Song, SongWith } from '@/models/song';
import { DBData, getDB } from './client';
import { getAvailableSlug, saveSlug } from './slug';
import { Filter } from 'mongodb';
import { SongArrangement } from '@/models/song-arrangement';

export type DBSong = SongWith<RequiredArrangements & RequiredLyrics>;
export type PersistedDBSong = SongWith<RequiredArrangements & RequiredLyrics & RequiredSlug>;
export type PersistedDBSongWithoutArrangements = Omit<PersistedDBSong, 'arrangements'>;

type RetrieveSongOptions = {
  acceptDeleted?: boolean;
  excludeArrangements?: boolean;
};
export function retrieveSongs({
  filter,
  options,
  dbData,
}: {
  filter?: Filter<PersistedDBSong>;
  options?: RetrieveSongOptions;
  dbData?: DBData;
}): Promise<(PersistedDBSong | PersistedDBSongWithoutArrangements)[]> {
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
          if (options?.excludeArrangements) {
            delete (song as any).arrangements;
          }
          return song;
        });
      })
  );
}

export function retrieveSongsBySlug(
  slugs: string[],
  { options, dbData }: { options?: RetrieveSongOptions; dbData?: DBData }
): Promise<(PersistedDBSong | PersistedDBSongWithoutArrangements)[]> {
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
): Promise<PersistedDBSong> {
  const { client, db, songs } = await getSongsCollection(dbData);
  const song = (slug && (await retrieveSong(slug, { client, db }))) || ({} as DBSong);
  if (title !== undefined) song.title = title;
  if (artist !== undefined) song.artist = artist;
  if (lyrics !== undefined) song.lyrics = lyrics;
  if (isDeleted !== undefined) song.isDeleted = isDeleted;
  if (arrangements !== undefined) song.arrangements = arrangements;
  if (arrangement !== undefined) {
    if (currentArrangementId !== undefined) {
      song.arrangements[currentArrangementId] = arrangement;
    } else {
      throw new Error('currentArrangementId must be defined when updating arrangement');
    }
  }

  if (slug) {
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
  return { client, db, songs: db.collection<PersistedDBSong>('songs') };
}
