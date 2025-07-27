import { PrismaClient } from "@/generated/prisma";
import { ClientSong, SongUnitType } from "../models";
import baseServices from "./services.json";
import baseSongs from "./songs.json";

export async function createSongsFromLocal(prisma: PrismaClient) {
  const songData = getSongData();
  const songs: ClientSong[] = [];
  for (const song of songData) {
    const existingSong =
      song.legacyId || song.slug
        ? await prisma.song.findFirst({
            where: { OR: [{ legacyId: song.legacyId }, { slug: song.slug }] },
            include: { arrangements: { include: { units: true } } },
          })
        : null;
    if (existingSong) {
      songs.push(existingSong);
    } else {
      const newSong = await prisma.song.create({
        data: song,
        include: { arrangements: { include: { units: true } } },
      });
      songs.push(newSong);
    }
  }
  return await prisma.song.findMany({
    include: { arrangements: { include: { units: true } } },
  });
}

export async function createServicesFromLocal(
  prisma: PrismaClient,
  songs: ClientSong[]
) {
  const serviceData = getServiceData(songs);

  for (const service of serviceData) {
    const existingService =
      service.legacyId || service.slug
        ? await prisma.service.findFirst({
            where: {
              OR: [{ legacyId: service.legacyId }, { slug: service.slug }],
            },
            include: { units: true },
          })
        : null;
    if (existingService) {
      console.log(
        `Service with legacyId ${
          service.legacyId ?? service.slug
        } already exists.`
      );
    } else {
      await prisma.service.create({ data: service });
    }
  }
}

function getSongData() {
  return baseSongs.map((songData) => ({
    legacyId: songData.legacyId,
    title: songData.title,
    slug: songData.slug,
    artist: songData.artist,
    lyrics: songData.lyrics,
    isDeleted: songData.isDeleted,
    arrangements: {
      create: songData.arrangements.map((arrangement) => ({
        key: arrangement.key,
        isDefault: arrangement.isDefault,
        isDeleted: arrangement.isDeleted,
        isServiceArrangement: false,
        units: {
          create: arrangement.units.map((unit) => ({
            content: unit.content,
            type: unit.type as SongUnitType,
            order: unit.internalId,
          })),
        },
      })),
    },
  }));
}

function getServiceData(songs: ClientSong[]) {
  const songDataBySlug = Object.fromEntries(
    songs.map((song) => [song.slug, song])
  );

  return baseServices.map((serviceData) => ({
    legacyId: serviceData.legacyId,
    title: serviceData.title,
    slug: serviceData.slug,
    date: serviceData.date,
    worshipLeader: serviceData.worshipLeader,
    isDeleted: serviceData.isDeleted,
    units: {
      create: serviceData.units.map((unit, idx) => {
        const song = songDataBySlug[unit.songSlug];
        if (!song) {
          throw new Error(`Song with slug ${unit.songSlug} not found`);
        }
        const arrangement = song.arrangements![unit.arrangementId];
        if (!arrangement) {
          return null;
        }
        const unitsByInternalId = Object.fromEntries(
          arrangement.units!.map((unit) => [unit.order, unit])
        );
        unit.additionalSongUnits.forEach((additionalUnit) => {
          unitsByInternalId[additionalUnit.internalId] = {
            id: -1,
            arrangementId: -1,
            content: additionalUnit.content,
            type: additionalUnit.type as SongUnitType,
            order: additionalUnit.internalId,
          };
        });
        return {
          type: "SONG" as const,
          semitoneTranspose: unit.semitoneTranspose,
          order: idx + 1,
          arrangement: {
            create: {
              key: arrangement.key,
              songId: song.id,
              originalArrangementId: arrangement.id,
              isDefault: false,
              isDeleted: arrangement.isDeleted,
              isServiceArrangement: true,
              units: {
                create: unit.songMap.map((internalId, idx) => {
                  return {
                    content: unitsByInternalId[internalId]?.content ?? "",
                    type: unitsByInternalId[internalId]?.type as SongUnitType ?? "BLOCK",
                    order: idx + 1,
                  };
                }),
              },
            },
          },
        };
      }).filter((unit): unit is NonNullable<typeof unit> => unit !== null),
    },
  }));
}
