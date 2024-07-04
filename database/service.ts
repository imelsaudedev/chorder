import { SerializedService, Service } from '@/models/service';
import { deserializers, SerializedServiceUnit, ServiceSongUnit, ServiceUnit } from '@/models/service-unit';
import { mapSongsBySlug, Song } from '@/models/song';
import { SerializedSongUnit, SongUnit } from '@/models/song-unit';
import { Filter } from 'mongodb';
import { DBData, getDB } from './client';
import { getAvailableSlug, saveSlug } from './slug';
import { retrieveSongsBySlug, saveSong } from './song';

type SerializedDBServiceSongUnit = {
  type: 'DB_SONG';
  songSlug: string;
  arrangementId: number;
  semitoneTranspose: number;
  additionalSongUnits: SerializedSongUnit[];
  songMap: number[];
};

class DBServiceSongUnit extends ServiceUnit {
  songSlug: string;
  arrangementId: number;
  semitoneTranspose: number;
  additionalSongUnits: SongUnit[];
  songMap: number[];

  constructor(
    songSlug: string,
    arrangementId: number,
    semitoneTranspose: number,
    additionalSongUnits: SongUnit[],
    songMap: number[]
  ) {
    super('DB_SONG');
    this.songSlug = songSlug;
    this.arrangementId = arrangementId;
    this.semitoneTranspose = semitoneTranspose;
    this.additionalSongUnits = additionalSongUnits;
    this.songMap = songMap;
  }

  serialize() {
    return {
      type: this.type,
      arrangementId: this.arrangementId,
      semitoneTranspose: this.semitoneTranspose,
      songSlug: this.songSlug,
      additionalSongUnits: this.additionalSongUnits,
      songMap: this.songMap,
    };
  }

  static deserialize(serialized: SerializedServiceUnit): ServiceUnit {
    if (serialized.type !== 'DB_SONG') {
      throw new Error('Invalid song unit type');
    }
    const serializedDBSongUnit = serialized as SerializedDBServiceSongUnit;
    return new DBServiceSongUnit(
      serializedDBSongUnit.songSlug,
      serializedDBSongUnit.arrangementId,
      serializedDBSongUnit.semitoneTranspose,
      serializedDBSongUnit.additionalSongUnits.map(SongUnit.deserialize),
      serializedDBSongUnit.songMap
    );
  }

  get isValid(): boolean {
    return !!this.songSlug && this.arrangementId !== undefined && this.songMap.length > 0;
  }
}
deserializers.set('DB_SONG', DBServiceSongUnit.deserialize);

type RetrieveServiceOptions = {
  acceptDeleted?: boolean;
  hydrate?: boolean;
};
export function retrieveServices({
  filter,
  options,
  dbData,
}: {
  filter?: Filter<SerializedService>;
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
      .then((serializedServices) => {
        const services = serializedServices.map(Service.deserialize);
        if (options?.hydrate) {
          return retrieveSongsBySlug(
            services.flatMap((service) => getSlugs(service.getUnitsByType<DBServiceSongUnit>('DB_SONG'))),
            { dbData }
          ).then((songs) => {
            services.forEach((service) => {
              hydrate(service, songs);
            });
            return services;
          });
        }
        return services;
      });
  });
}

export function retrieveService(slug: string): Promise<Service | null> {
  return getServicesCollection().then(({ services, db, client }) => {
    const dbData = { client, db };
    return services.findOne({ slug, isDeleted: false }).then((serializedService) => {
      if (serializedService) {
        const service = Service.deserialize(serializedService);
        const songUnits = service.getUnitsByType<DBServiceSongUnit>('DB_SONG');
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

export async function saveService(service: Service): Promise<Service> {
  const { client, db, services } = await getServicesCollection();
  const dbData = { client, db };
  const modifiedSongs = await extractSongs(service, dbData);
  replaceDBSongUnitInService(service);

  const session = client.startSession();
  try {
    await session.withTransaction(async () => {
      if (service.slug) {
        await services.updateOne({ slug: service.slug }, { $set: service.serialize() });
      } else {
        const slug = await getAvailableSlug(service.dateForSlug, dbData);
        service.slug = slug;
        await services.insertOne(service.serialize());
        await saveSlug(slug);
      }
      if (modifiedSongs.length > 0) {
        await Promise.all(modifiedSongs.map((song) => saveSong(song, dbData)));
      }
    });
  } finally {
    await session.endSession();
    await client.close();
  }
  return service;
}

async function getServicesCollection(dbData?: DBData) {
  const { client, db } = await getDB(dbData);
  return { client, db, services: db.collection<SerializedService>('services') };
}

async function extractSongs(service: Service, dbData: DBData): Promise<Song[]> {
  const songUnits = service.getUnitsByType<ServiceSongUnit>('SONG');
  const allSlugs = songUnits.map((songUnit) => songUnit.song.slug!);
  const songs = await retrieveSongsBySlug(allSlugs, { options: { acceptDeleted: true }, dbData });
  const songsBySlug = mapSongsBySlug(songs);

  const modifiedSongs = (
    await Promise.all(
      songUnits.map(async (songUnit) => {
        const slug = songUnit.song.slug!;
        const referenceSong = songsBySlug.get(slug);
        if (!referenceSong) throw new Error(`Song with slug ${slug} not found`);

        referenceSong.currentArrangementId = songUnit.arrangementId;
        songUnit.additionalSongUnits = songUnit.arrangement.extractDiff(referenceSong.currentArrangement!);

        if (songUnit.arrangement.lastUnitId !== referenceSong.currentArrangement!.lastUnitId) {
          referenceSong.currentArrangement!.lastUnitId = songUnit.arrangement.lastUnitId;
          return referenceSong;
        } else {
          return null;
        }
      })
    )
  ).filter((song) => song !== null) as Song[];

  return modifiedSongs;
}

function replaceDBSongUnitInService(service: Service) {
  service.units = service.units.map((unit) => {
    if (unit.type !== 'SONG') return unit;
    const songUnit = unit as ServiceSongUnit;
    return new DBServiceSongUnit(
      songUnit.song.slug!,
      songUnit.arrangementId,
      songUnit.semitoneTranspose,
      songUnit.additionalSongUnits,
      songUnit.arrangement.songMap!
    );
  });
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

    const newUnit = new ServiceSongUnit({
      song,
      arrangementId: songUnit.arrangementId,
      semitoneTranspose: songUnit.semitoneTranspose,
    });

    song.currentArrangementId = songUnit.arrangementId;
    const arrangement = song.currentArrangement!;
    arrangement.semitoneTranspose = songUnit.semitoneTranspose;
    arrangement.forceSetUnits([...arrangement.units, ...songUnit.additionalSongUnits]);
    arrangement.forceSetSongMap(songUnit.songMap);

    return newUnit;
  });
}
