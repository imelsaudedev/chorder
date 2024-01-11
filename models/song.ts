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
  isDefault: boolean;
  deleted: boolean;
};

export function getVersionOrDefault(
  song: Song | null,
  versionId: number | null
) {
  if (song === null) return null;
  if (versionId) {
    return (
      song.versions.filter((version) => version.id === versionId)[0] || null
    );
  }

  const defaultVersions = song.versions.filter((version) => version.isDefault);
  return defaultVersions[0] || null;
}

export async function createOrUpdateSong(
  songId: number | null,
  versionId: number | null,
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
      versions: {
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
      versions: {
        update: {
          where: {
            id: versionId,
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

export async function deleteSongVersion(id: number) {
  // TODO: MAKE NEXT VERSION THE DEFAULT ONE
  await prisma.songVersion.update({
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
        versions: {
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
        versions: song.versions.map((version) => {
          return {
            ...version,
            unitSequence: version.unitMap.split(",").map(Number),
          };
        }),
      };
    });
}

export function fetchAllSongs(): Promise<
  Pick<Song, "id" | "artist" | "lyrics" | "title">[]
> {
  return prisma.song.findMany({
    where: {
      versions: {
        some: {
          deleted: false,
        },
      },
    },
  });
}
