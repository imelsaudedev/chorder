import { dateForSlug, getUnitsByType, NewService, Service } from '@/models/service';
import { ServiceSongUnit } from '@/models/service-unit';
import { mapSongsBySlug, RequiredArrangement, setArrangement, Song, SongWith } from '@/models/song';
import { extractDiff } from '@/models/song-arrangement';
import { SongUnit } from '@/models/song-unit';
import { Filter } from 'mongodb';
import { DBData, getDB } from './client';
import { getAvailableSlug, saveSlug } from './slug';
import { retrieveSongsBySlug, saveSong } from './song';

type DBServiceSongUnit = {
  type: 'DB_SONG';
  songSlug: string;
  arrangementId: number;
  semitoneTranspose: number;
  additionalSongUnits: SongUnit[];
  songMap: number[];
};

type RetrieveServiceOptions = {
  acceptDeleted?: boolean;
  hydrate?: boolean;
};
export function retrieveServices({
  filter,
  options,
  dbData,
}: {
  filter?: Filter<Service>;
  options?: RetrieveServiceOptions;
  dbData?: DBData;
}): Promise<Service[]> {
  const combinedFilter = filter || {};
  if (!options?.acceptDeleted) {
    combinedFilter['isDeleted'] = false;
  }
  return getServicesCollection(dbData).then(({ services }) => {
    return services
      .find(combinedFilter)
      .toArray()
      .then((services) => {
        if (options?.hydrate) {
          return retrieveSongsBySlug(
            services.flatMap((service) => getSlugs(getUnitsByType<DBServiceSongUnit>(service, 'DB_SONG'))),
            { dbData }
          ).then((songs) => {
            services.forEach((service) => {
              hydrate(service, songs);
            });
            return services;
          });
        }
        return services;
      })
      .then((services) => {
        services.forEach((service) => {
          delete (service as any)._id;
        });
        return services;
      });
  });
}

export function retrieveService(slug: string): Promise<Service | null> {
  return getServicesCollection().then(({ services, db, client }) => {
    const dbData = { client, db };
    return services.findOne({ slug, isDeleted: false }).then((service) => {
      if (service) {
        const songUnits = getUnitsByType<DBServiceSongUnit>(service, 'DB_SONG');
        const allSlugs = getSlugs(songUnits);
        return retrieveSongsBySlug(allSlugs, { dbData }).then((songs) => {
          hydrate(service, songs);
          return service;
        });
      } else {
        return null;
      }
    });
  });
}

export async function saveService(service: NewService): Promise<Service> {
  const { client, db, services } = await getServicesCollection();
  const dbData = { client, db };
  const modifiedSongs = await extractSongsAndReplaceSongUnits(service, dbData);

  const session = client.startSession();
  try {
    await session.withTransaction(async () => {
      if (service.slug) {
        await services.updateOne({ slug: service.slug }, { $set: service });
      } else {
        const slug = await getAvailableSlug(dateForSlug(service.date), dbData);
        service.slug = slug;
        await services.insertOne(service as Service);
        await saveSlug(slug);
      }
      if (modifiedSongs.length > 0) {
        await Promise.all(
          modifiedSongs.map((song) =>
            saveSong(
              { slug: song.slug, arrangement: song.arrangement, currentArrangementId: song.currentArrangementId },
              dbData
            )
          )
        );
      }
    });
  } catch (e) {
    console.error(e, `\nFailed with service ${JSON.stringify(service, null, 2)}`);
    throw new Error('Failed to update service');
  } finally {
    await session.endSession();
    await client.close();
  }
  return service as Service;
}

async function getServicesCollection(dbData?: DBData) {
  const { client, db } = await getDB(dbData);
  return { client, db, services: db.collection<Service>('services') };
}

async function extractSongsAndReplaceSongUnits(service: NewService, dbData: DBData) {
  const songUnits = getUnitsByType<ServiceSongUnit>(service, 'SONG');
  const allSlugs = songUnits.map((songUnit) => songUnit.song.slug);
  const songs = (
    (await retrieveSongsBySlug(allSlugs, {
      options: { acceptDeleted: true },
      dbData,
    })) as Song[]
  ).map((song) => setArrangement(song)) as SongWith<RequiredArrangement>[];
  const songsBySlug = mapSongsBySlug<SongWith<RequiredArrangement>>(songs);

  const modifiedSongs: SongWith<RequiredArrangement>[] = [];
  service.units = await Promise.all(
    service.units.map(async (unit) => {
      if (unit.type !== 'SONG') return unit;
      const songUnit = unit as ServiceSongUnit;
      const slug = songUnit.song.slug;
      const referenceSong = songsBySlug.get(slug);
      if (!referenceSong) throw new Error(`Song with slug ${slug} not found`);

      referenceSong.currentArrangementId = songUnit.arrangementId;
      const referenceSongWithArrangement = setArrangement(referenceSong);
      const [additionalSongUnits, songMap, lastUnitId] = extractDiff(
        songUnit.song.arrangement,
        referenceSongWithArrangement.arrangement
      );

      const dbSongUnit = {
        type: 'DB_SONG',
        songSlug: songUnit.song.slug,
        arrangementId: songUnit.arrangementId,
        semitoneTranspose: songUnit.song.arrangement.semitoneTranspose,
        additionalSongUnits,
        songMap,
      };

      if ((referenceSongWithArrangement.arrangement.lastUnitId, lastUnitId)) {
        referenceSongWithArrangement.arrangement.lastUnitId = lastUnitId;
        modifiedSongs.push(referenceSongWithArrangement);
      }

      return dbSongUnit;
    })
  );

  return modifiedSongs;
}

function getSlugs(songUnits: DBServiceSongUnit[]) {
  return songUnits.map((songUnit) => songUnit.songSlug);
}

function hydrate(service: Service, songs: Song[]) {
  service.units = service.units.map((unit) => {
    if (unit.type !== 'DB_SONG') return unit;

    const songUnit = unit as DBServiceSongUnit;
    const song = songs.find((song) => song.slug === songUnit.songSlug);
    if (!song) throw new Error(`Song with slug ${songUnit.songSlug} not found`);

    song.currentArrangementId = songUnit.arrangementId;
    const songWithArrangement = setArrangement(song);
    songWithArrangement.arrangement.semitoneTranspose = songUnit.semitoneTranspose;
    const newUnit: ServiceSongUnit = {
      type: 'SONG',
      song: songWithArrangement,
      arrangementId: songUnit.arrangementId,
    };

    const arrangement = songWithArrangement.arrangement;
    arrangement.semitoneTranspose = songUnit.semitoneTranspose;
    arrangement.units = [...arrangement.units, ...songUnit.additionalSongUnits];
    arrangement.songMap = songUnit.songMap;

    return newUnit;
  });
}
