import { Unit } from "./unit";
import prisma from "@/lib/prisma";

export type SongBase = {
  id: number;
  title: string;
  artist?: string | null;
  lyrics: string;
};

export type Song = SongBase & {
  arrangements: SongArrangement[];
};

export type SongArrangement = {
  id: number;
  units: Unit[];
  unitSequence: number[];
  isDefault: boolean;
  deleted: boolean;
};

export function getArrangementOrDefault(
  song: Song | null,
  arrangementId: number | null
) {
  if (song === null) return null;
  if (arrangementId) {
    return (
      song.arrangements.filter((arrangement) => arrangement.id === arrangementId)[0] || null
    );
  }

  const defaultArrangements = song.arrangements.filter((arrangement) => arrangement.isDefault);
  return defaultArrangements[0] || null;
}

export async function createOrUpdateSong(
  songId: number | null,
  arrangementId: number | null,
  title: string,
  lyrics: string,
  availableUnits: Unit[],
  unitMap: string,
  artist?: string
) {
  const unitUpserts = availableUnits.map((unit) => ({
    create: {
      title: unit.title,
      content: unit.content,
      type: unit.type,
      localId: unit.localId,
    },
    update: {
      title: unit.title,
      content: unit.content,
      type: unit.type,
    },
    where: {
      id: unit.id,
    },
  }));

  const query = {
    where: {
      id: songId,
    },
    create: {
      title,
      lyrics,
      artist,
      arrangements: {
        create: [
          {
            unitMap,
            isDefault: true,
            deleted: false,
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
    update: {
      title,
      lyrics,
      artist,
      arrangements: {
        update: {
          where: {
            id: arrangementId,
          },
          data: {
            unitMap,
            units: {
              upsert: unitUpserts,
            },
          },
        },
      },
    },
  };

  const song = await prisma.song.upsert(query);

  return song;
}

export async function deleteSongArrangement(id: number) {
  // TODO: MAKE NEXT ARRANGEMENT THE DEFAULT ONE
  await prisma.songArrangement.update({
    where: {
      id,
    },
    data: {
      deleted: true,
    },
  });
}

export function fetchSong(id: number): Promise<Song | null> {
  return prisma.song
    .findUnique({
      where: { id },
      include: {
        arrangements: {
          where: {
            deleted: false,
          },
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
        arrangements: song.arrangements.map((arrangement) => {
          return {
            ...arrangement,
            unitSequence: arrangement.unitMap.split(",").map(Number),
          };
        }),
      };
    });
}

export function fetchAllSongs(): Promise<SongBase[]> {
  return prisma.song.findMany({
    where: {
      arrangements: {
        some: {
          deleted: false,
        },
      },
    },
  });
}

export function groupSongsByFirstLetter(
  songs: SongBase[]
): Map<string, SongBase[]> {
  const byFirstLetter = new Map<string, SongBase[]>();

  songs.forEach((song) => {
    const firstLetter = song.title.trim().charAt(0).toLowerCase();
    let letterGroup = byFirstLetter.get(firstLetter);
    if (!letterGroup) {
      letterGroup = [];
      byFirstLetter.set(firstLetter, letterGroup);
    }

    letterGroup.push(song);
  });

  return byFirstLetter;
}
