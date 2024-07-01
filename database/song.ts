import { SerializedSong, Song } from '@/models/song';
import { getDB } from './client';
import { getAvailableSlug, saveSlug } from './slug';

export function retrieveAllSongs(): Promise<Song[]> {
  return getCollection().then(({ songs }) => {
    return songs
      .find({ isDeleted: false })
      .toArray()
      .then((serializedSongs) => {
        return serializedSongs.map(Song.deserialize);
      });
  });
}

export function retrieveSong(slug: string): Promise<Song | null> {
  return getCollection().then(({ songs }) => {
    return songs.findOne({ slug, isDeleted: false }).then((serializedSong) => {
      if (serializedSong) {
        return Song.deserialize(serializedSong);
      } else {
        return null;
      }
    });
  });
}

export async function saveSong(song: Song): Promise<Song> {
  const { client, songs } = await getCollection();
  if (song.slug) {
    await songs.updateOne({ slug: song.slug }, { $set: song.serialize() });
  } else {
    const slug = await getAvailableSlug(song.title);
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

async function getCollection() {
  const { client, db } = await getDB();
  return { client, songs: db.collection<SerializedSong>('songs') };
}
