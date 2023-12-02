import { Unit } from "./unit";
import prisma from "@/lib/prisma";

export type Song = {
  id: number;
  title: string;
  artist?: string | null;
  lyrics: string;
  versions: SongVersion[];
};

export type SongVersion = {
  id: number;
  units: Unit[];
  unitSequence: number[];
};

export async function createSong(
  title: string,
  lyrics: string,
  availableUnits: Unit[],
  unitMap: string,
  artist?: string
) {
  const song = await prisma.song.create({
    data: {
      title,
      lyrics,
      artist,
      versions: {
        create: [
          {
            unitMap,
            units: {
              create: availableUnits.map((unit) => ({
                title: unit.title,
                content: unit.content,
                type: unit.type,
                localId: unit.localId,
              })),
            },
          },
        ],
      },
    },
  });

  return song;
}

export function fetchSong(id: number): Promise<Song | null> {
  return prisma.song
    .findUnique({
      where: { id },
      include: {
        versions: {
          include: {
            units: true,
          },
        },
      },
    })
    .then((song) => {
      if (!song) return song;

      return {
        ...song,
        versions: song.versions.map((version) => {
          return {
            ...version,
            unitSequence: version.unitMap.split(",").map(Number),
          };
        }),
      };
    });
}
