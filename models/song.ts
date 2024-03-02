import { Unit, pruneUnits } from "./unit";
import prisma from "@/lib/prisma";

export type SongBase = {
  id?: number;
  title: string;
  artist?: string | null;
  lyrics: string;
};

export type Song = SongBase & {
  arrangements: SongArrangement[];
};

export type SongArrangement = {
  id?: number;
  key?: string;
  units: ArrangementUnit[];
  isDefault: boolean;
  deleted: boolean;
};

export type ArrangementUnit = {
  id?: number;
  arrangement?: SongArrangement;
  arrangementId?: number;
  unit?: Unit;
  unitId?: number;
  indexInArrangement: number;
};

export function getArrangementOrDefault(
  song: Song | null,
  arrangementId: number | null
) {
  if (song === null) return null;
  if (arrangementId) {
    return (
      song.arrangements.filter(
        (arrangement) => arrangement.id === arrangementId
      )[0] || null
    );
  }

  const defaultArrangements = song.arrangements.filter(
    (arrangement) => arrangement.isDefault
  );
  return defaultArrangements[0] || null;
}

export async function createOrUpdateUnits(units: Unit[]) {
  if (units.length === 0) return [];

  if (units.some((unit) => !unit.localUID)) {
    throw new Error("Unit is missing localUID");
  }

  await prisma.$transaction(
    units.map((unit) =>
      unit.id
        ? prisma.dBUnit.update({
            where: {
              id: unit.id,
            },
            data: {
              title: unit.title,
              content: unit.content,
              type: unit.type,
              localUID: unit.localUID,
            },
          })
        : prisma.dBUnit.create({
            data: {
              title: unit.title || null,
              content: unit.content,
              type: unit.type,
              localUID: unit.localUID || null,
            },
          })
    )
  );

  return await prisma.dBUnit.findMany({
    where: {
      localUID: {
        in: units.map((unit) => unit.localUID as string),
      },
    },
  });
}

export async function createOrUpdateSong(
  songId: number | null,
  arrangementId: number | null,
  title: string,
  lyrics: string,
  arrangementUnits: ArrangementUnit[],
  artist: string | undefined,
  songKey: string
) {
  const allUnits = arrangementUnits
    .map((arrangementUnit) => arrangementUnit.unit)
    .filter(Boolean) as Unit[];
  const units = Array.from(
    new Map(allUnits.map((unit) => [unit.localUID, unit])).values()
  );

  const unitsWithId = createOrUpdateUnits(units);
  const localUIDToUnit = new Map(
    (await unitsWithId).map((unit) => [unit.localUID, unit])
  );

  const arrangementUnitCreates = arrangementUnits.map((unit) => ({
    indexInArrangement: unit.indexInArrangement,
    unit: {
      connect: {
        id: localUIDToUnit.get(unit.unit?.localUID as string)?.id,
      },
    },
  }));

  let songs;
  if (songId) {
    songs = await prisma.dBSong.update({
      where: {
        id: songId,
      },
      data: {
        title,
        lyrics,
        artist,
        arrangements: {
          update: {
            where: {
              id: arrangementId as number,
            },
            data: {
              key: songKey,
              units: {
                deleteMany: {},
                create: arrangementUnitCreates,
              },
            },
          },
        },
      },
    });
  } else {
    songs = await prisma.dBSong.create({
      data: {
        title,
        lyrics,
        artist,
        arrangements: {
          create: [
            {
              isDefault: true,
              deleted: false,
              key: songKey,
              units: {
                create: arrangementUnitCreates,
              },
            },
          ],
        },
      },
    });
  }
  await pruneUnits();
  return songs;
}

export async function deleteSongArrangement(id: number) {
  // TODO: MAKE NEXT ARRANGEMENT THE DEFAULT ONE
  await prisma.dBSongArrangement.update({
    where: {
      id,
    },
    data: {
      deleted: true,
    },
  });
}

export function fetchSong(id: number): Promise<Song | null> {
  return prisma.dBSong
    .findUnique({
      where: { id },
      include: {
        arrangements: {
          where: {
            deleted: false,
          },
          include: {
            units: {
              include: {
                unit: true,
              },
            },
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
            units: arrangement.units.sort(
              (a, b) => a.indexInArrangement - b.indexInArrangement
            ),
          };
        }),
      };
    });
}

export function fetchAllSongs(): Promise<SongBase[]> {
  return prisma.dBSong.findMany({
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
