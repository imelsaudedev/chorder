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
  unitSequence: number[],
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
            unitSequence: unitSequence.join(","),
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

export function fetchSong(id: number) {
  return prisma.song.findUnique({
    where: { id },
    include: {
      versions: {
        include: {
          units: true,
        },
      },
    },
  });
}
