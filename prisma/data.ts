import { getLyrics } from "@/chopro/music";
import prisma from "./client";
import {
  ClientArrangement,
  ClientService,
  ClientServiceSongUnit,
  ClientServiceUnit,
  ClientSong,
} from "./models";

export function retrieveSongSlugs() {
  return prisma.song
    .findMany({
      where: {
        isDeleted: false,
      },
      select: {
        slug: true,
      },
    })
    .then((songs) => songs.map((song) => song.slug));
}

export async function slugForSong(title: string) {
  const slugs = await retrieveSongSlugs();
  if (containsOnlyDigits(title)) title = `${title}-song`;
  return slugFor(title, slugs);
}

export async function retrieveServiceSlugs() {
  return prisma.service
    .findMany({
      where: {
        isDeleted: false,
      },
      select: {
        slug: true,
      },
    })
    .then((services) => services.map((service) => service.slug));
}

export async function slugForService(date: Date) {
  // Default slug format: YYYY-MM-DD
  const dateString = date.toISOString().split("T")[0];
  const slugs = await retrieveServiceSlugs();
  return slugFor(dateString, slugs);
}

export async function slugFor(original: string, slugs: string[]) {
  let slug = original
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9]/g, "-");
  let idx = 1;
  let newSlug = slug;
  while (slugs.includes(newSlug)) {
    newSlug = `${slug}-${idx}`;
    idx++;
  }
  slugs.push(newSlug);
  return newSlug;
}

export async function retrieveSongs({
  query = "",
  limitLines,
  forceIncludeFirstLine = true,
  excludedSongSlugs = [],
}: {
  query?: string;
  limitLines?: number;
  forceIncludeFirstLine?: boolean;
  excludedSongSlugs?: string[];
}): Promise<ClientSong[]> {
  let songs: ClientSong[] = await prisma.song.findMany({
    where: {
      isDeleted: false,
      slug: {
        notIn: excludedSongSlugs,
      },
      OR: [
        {
          title: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          artist: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          lyrics: {
            contains: query,
            mode: "insensitive",
          },
        },
      ],
    },
    omit: { legacyId: true },
  });
  if (limitLines) {
    songs = songs.map((song) =>
      limitLyrics(song, limitLines, forceIncludeFirstLine, query)
    );
  }
  return songs;
}

export async function retrieveSong(
  slugOrId: string | number,
  {
    includeArrangements = false,
    includeUnits = false,
  }: {
    includeArrangements?: boolean;
    includeUnits?: boolean;
  } = {}
): Promise<ClientSong | null> {
  const where: { isDeleted: boolean; slug?: string; id?: number } = {
    isDeleted: false,
    ...selectSlugOrId(slugOrId),
  };
  return prisma.song.findFirst({
    where,
    include: {
      arrangements: includeArrangements
        ? {
            where: { isDeleted: false },
            include: {
              units: includeUnits,
            },
          }
        : false,
    },
  });
}

export async function retrieveSongArrangements(
  songSlugOrId: string | number,
  {
    includeSong = false,
    includeUnits = false,
  }: {
    includeSong?: boolean;
    includeUnits?: boolean;
  } = {}
): Promise<ClientArrangement[]> {
  return prisma.songArrangement.findMany({
    where: {
      song: selectSlugOrId(songSlugOrId),
      isDeleted: false,
    },
    include: {
      song: includeSong,
      units: includeUnits,
    },
  });
}

export async function retrieveArrangement(
  arrangementId?: number | null,
  {
    songSlugOrId,
    includeUnits,
    includeSong,
  }: {
    songSlugOrId?: string | number;
    includeUnits?: boolean;
    includeSong?: boolean;
  } = {}
): Promise<ClientArrangement | null> {
  if (!arrangementId && !songSlugOrId) {
    throw new Error(
      "Song slug or id is required to retrieve default arrangement"
    );
  }
  if (!arrangementId) {
    return prisma.songArrangement.findFirst({
      where: {
        song: {
          ...selectSlugOrId(songSlugOrId!),
          isDeleted: false,
        },
        isDefault: true,
        isDeleted: false,
      },
      include: {
        units: includeUnits,
        song: includeSong
          ? {
              include: {
                arrangements: {
                  where: { isDeleted: false },
                },
              },
            }
          : false,
      },
    });
  }

  const where: {
    id: number;
    isDeleted: boolean;
    song?: { id?: number; slug?: string; isDeleted: boolean };
  } = {
    id: arrangementId,
    isDeleted: false,
  };
  if (songSlugOrId) {
    where["song"] = {
      ...selectSlugOrId(songSlugOrId),
      isDeleted: false,
    };
  }

  return prisma.songArrangement.findFirst({
    where,
    include: {
      units: includeUnits,
      song: includeSong
        ? {
            include: {
              arrangements: {
                where: { isDeleted: false },
              },
            },
          }
        : false,
    },
  });
}

export async function createArrangementWithSong(
  arrangement: ClientArrangement,
  {
    includeSong = false,
    includeUnits = false,
  }: {
    includeSong?: boolean;
    includeUnits?: boolean;
  } = {}
): Promise<ClientArrangement> {
  if (!arrangement.song) {
    throw new Error("Arrangement must have a song to create an arrangement");
  }
  const songSlug = await slugForSong(arrangement.song.title);
  if (!arrangement.units || arrangement.units.length === 0) {
    throw new Error("Arrangement must have at least one unit");
  }
  const lyrics = arrangement.units
    .map((unit) => getLyrics(unit.content))
    .join("\n");
  const title = arrangement.song.title;
  const artist =
    arrangement.song.artist && arrangement.song.artist.trim().length
      ? arrangement.song.artist
      : null;

  const createdArrangement = await prisma.songArrangement.create({
    data: {
      name: arrangement.name,
      key: arrangement.key,
      isDefault: arrangement.isDefault,
      song: {
        connectOrCreate: {
          where: { slug: songSlug },
          create: {
            slug: songSlug,
            title,
            artist,
            lyrics,
          },
        },
      },
      units: {
        createMany: {
          data: arrangement.units,
        },
      },
    },
    include: {
      song: true,
      units: includeUnits,
    },
  });
  if (createdArrangement.song.isDeleted) {
    // Restore the song if it was previously deleted
    await prisma.song.update({
      where: { id: createdArrangement.song.id },
      data: {
        isDeleted: false,
        slug: songSlug,
        title,
        artist,
        lyrics,
      },
    });
    await makeArrangementDefault(createdArrangement.id);
  }
  if (!includeSong) {
    const { song, ...rest } = createdArrangement;
    return rest;
  }
  return createdArrangement;
}

export async function updateArrangement(
  arrangement: ClientArrangement,
  {
    includeSong = false,
    includeUnits = false,
  }: {
    includeSong?: boolean;
    includeUnits?: boolean;
  } = {}
): Promise<ClientArrangement> {
  if (!arrangement.id) {
    throw new Error("Arrangement ID is required to update an arrangement");
  }
  const baseArrangement = await retrieveArrangement(arrangement.id, {
    includeSong,
    includeUnits,
  });
  if (!baseArrangement) {
    throw new Error("Arrangement not found");
  }
  const arrangementData: {
    id: number;
    name?: string | null;
    key?: string;
    units?: any;
  } = {
    id: arrangement.id,
    name: arrangement.name,
    key: arrangement.key,
  };

  const song = arrangement.song ?? baseArrangement.song!;
  const songData: {
    title: string;
    artist: string | null;
    lyrics?: string;
  } = {
    title: song.title,
    artist: song.artist,
  };
  if (arrangement.isDefault && arrangement.units) {
    songData.lyrics = arrangement.units
      .map((unit) => getLyrics(unit.content))
      .join("\n");
  }

  if (arrangement.units) {
    arrangementData["units"] = {
      deleteMany: {},
      createMany: {
        data: arrangement.units,
      },
    };
  }
  await prisma.song.update({
    where: { slug: song.slug },
    data: songData,
  });
  return prisma.songArrangement.update({
    where: {
      id: arrangement.id,
    },
    data: arrangementData,
    include: {
      song: includeSong
        ? {
            include: {
              arrangements: {
                where: { isDeleted: false },
              },
            },
          }
        : false,
      units: includeUnits,
    },
  });
}

export async function makeArrangementDefault(
  arrangementId: number
): Promise<void> {
  const arrangement = await prisma.songArrangement.findUnique({
    where: { id: arrangementId },
    include: {
      song: {
        include: {
          arrangements: {
            where: { isDefault: true },
          },
        },
      },
    },
  });
  if (!arrangement) throw new Error("Arrangement not found");
  if (!arrangement.song) throw new Error("Song not found");

  const updates = [
    prisma.songArrangement.update({
      where: { id: arrangementId },
      data: { isDefault: true },
    }),
  ];
  if (arrangement.song.arrangements.length !== 0) {
    const defaultArrangement = arrangement.song.arrangements.find(
      (arr) => arr.isDefault
    );
    if (defaultArrangement) {
      updates.push(
        prisma.songArrangement.update({
          where: { id: defaultArrangement.id },
          data: { isDefault: false },
        })
      );
    }
  }

  await prisma.$transaction(updates);
}

export async function moveArrangement(
  arrangementId: number,
  songSlugOrId: string | number
): Promise<void> {
  const [song, arrangement] = await Promise.all([
    retrieveSong(songSlugOrId, {
      includeArrangements: true,
    }),
    retrieveArrangement(arrangementId, {
      includeSong: true,
    }),
  ]);

  if (!song) throw new Error("Destination song not found");
  if (!arrangement) throw new Error("Arrangement not found");
  if (!arrangement.song) throw new Error("Original song not found");
  const originalSongId = arrangement.song.id!;
  const wasDefault = arrangement.isDefault;

  const isDefault = song.arrangements!.length === 0;
  await prisma.songArrangement.update({
    where: { id: arrangementId },
    data: { isDefault, songId: song.id },
  });

  if (wasDefault) {
    await updateDefaultArrangement(originalSongId);
  }
}

async function updateDefaultArrangement(songId: number): Promise<void> {
  const originalSong = await retrieveSong(songId, {
    includeArrangements: true,
  });
  if (!originalSong || !originalSong.arrangements) {
    return;
  }
  const notDeletedArrangements = originalSong.arrangements.filter(
    (arr) => !arr.isDeleted
  );

  if (notDeletedArrangements.length > 0) {
    await prisma.songArrangement.update({
      where: { id: notDeletedArrangements[0].id },
      data: { isDefault: true },
    });
  } else {
    await prisma.song.update({
      where: { id: songId },
      data: { isDeleted: true },
    });
  }
}

export async function deleteDefaultArrangement(
  songSlugOrId: string | number
): Promise<boolean> {
  const song = await retrieveSong(songSlugOrId, {
    includeArrangements: true,
  });
  if (!song?.arrangements?.length) {
    console.error(
      `No arrangements found for song ${songSlugOrId}. Cannot delete default arrangement`
    );
    return false;
  }
  const defaultArrangement = song.arrangements.find(
    (arr) => arr.isDefault && !arr.isDeleted
  );
  if (defaultArrangement) {
    await prisma.songArrangement.update({
      where: {
        id: defaultArrangement.id,
        isDefault: true,
        isDeleted: false,
      },
      data: { isDeleted: true },
      include: {
        song: true,
      },
    });
  } else {
    console.error(
      `No default arrangement found for song ${songSlugOrId}. Cannot delete default arrangement`
    );
    return false;
  }
  await updateDefaultArrangement(song.id!);
  return true;
}

export async function deleteArrangement(
  arrangementId: number
): Promise<boolean> {
  const arrangement = await prisma.songArrangement.update({
    where: { id: arrangementId },
    data: { isDeleted: true },
    include: {
      song: true,
    },
  });
  console.log(arrangement);
  if (!arrangement?.song) {
    console.error(
      `Arrangement with ID ${arrangementId} not found or already deleted`
    );
    return false;
  }
  await updateDefaultArrangement(arrangement.song.id);
  return true;
}

export async function retrieveService(
  slugOrId: string | number
): Promise<ClientService | null> {
  return prisma.service.findFirst({
    where: {
      ...selectSlugOrId(slugOrId),
      isDeleted: false,
    },
    include: {
      units: {
        include: {
          arrangement: {
            where: {
              isDeleted: false,
            },
            include: {
              song: true,
            },
          },
        },
      },
    },
  });
}

export async function retrieveServices(): Promise<ClientService[]> {
  return prisma.service.findMany({
    where: {
      isDeleted: false,
    },
  });
}

export async function createOrUpdateService(
  title: string | null | undefined,
  slug: string | null | undefined,
  worshipLeader: string | null,
  date: Date,
  units: ClientServiceUnit[]
): Promise<ClientService> {
  const serviceSlug = slug ?? (await slugForService(date));
  const serviceUnits = await createOrUpdateServiceArrangements(units);

  const baseData = {
    slug: serviceSlug,
    title,
    worshipLeader,
    date,
    units: {
      createMany: {
        data: serviceUnits.map((unit) => ({
          type: unit.type,
          arrangementId: unit.arrangementId,
          semitoneTranspose: unit.semitoneTranspose,
          order: unit.order,
        })),
      },
    },
  };
  return prisma.service.upsert({
    where: {
      slug: serviceSlug,
    },
    update: {
      ...baseData,
      units: {
        ...baseData.units,
        deleteMany: {},
      },
    },
    create: baseData,
    include: {
      units: {
        include: {
          arrangement: {
            include: {
              song: true,
              units: true,
            },
          },
        },
      },
    },
  });
}

async function createOrUpdateServiceArrangements(
  units: ClientServiceSongUnit[]
) {
  const unitPromises = units.map(async (unit) => {
    if (unit.type === "SONG") {
      const arrangement = await prisma.songArrangement.upsert({
        where: {
          id: unit.arrangementId ?? undefined,
        },
        update: {
          name: unit.arrangement!!.name,
          key: unit.arrangement!!.key,
          units: {
            deleteMany: {},
            createMany: {
              data: unit.arrangement!!.units ?? [],
            },
          },
        },
        create: {
          name: unit.arrangement!!.name,
          key: unit.arrangement!!.key,
          song: {
            connect: {
              id: unit.arrangement!!.songId,
            },
          },
          units: {
            createMany: {
              data: unit.arrangement!!.units ?? [],
            },
          },
        },
        include: {
          units: true,
          song: true,
        },
      });
      return {
        ...unit,
        arrangementId: arrangement.id,
      };
    }
    return unit;
  });
  return await Promise.all(unitPromises);
}

export async function deleteService(slugOrId: string | number): Promise<void> {
  const service = await prisma.service.findFirst({
    where: {
      ...selectSlugOrId(slugOrId),
      isDeleted: false,
    },
  });
  if (!service) {
    throw new Error("Service not found");
  }
  await prisma.service.update({
    where: { id: service.id },
    data: { isDeleted: true },
  });
}

function limitLyrics(
  song: ClientSong,
  limitLines: number,
  forceIncludeFirstLine: boolean,
  query: string
): ClientSong {
  let lineLimit = limitLines;
  const lyricsLines = song.lyrics.split("\n");
  const includedLines = [];
  if (forceIncludeFirstLine) {
    includedLines.push(lyricsLines[0]);
    lineLimit--;
  }
  if (query) {
    lineLimit = extractMatchingLines(
      lyricsLines,
      query,
      lineLimit,
      includedLines
    );
  } else {
    includedLines.push(...lyricsLines.slice(1, lineLimit + 1));
  }
  return {
    ...song,
    lyrics: includedLines.join("\n"),
  };
}

function extractMatchingLines(
  lyricsLines: string[],
  query: string,
  lineLimit: number,
  includedLines: any[]
): number {
  let prevLineIncluded = true;
  for (const line of lyricsLines) {
    if (lineLimit <= 0) break;
    if (line.toLowerCase().includes(query.toLowerCase())) {
      if (!prevLineIncluded) {
        includedLines.push("...");
        lineLimit--;
      }
      includedLines.push(line);
      lineLimit--;
      prevLineIncluded = true;
    } else {
      prevLineIncluded = false;
    }
  }
  return lineLimit;
}

function containsOnlyDigits(title: string) {
  return /^\d+$/.test(title);
}

function selectSlugOrId(slugOrId: string | number): {
  slug?: string;
  id?: number;
} {
  if (typeof slugOrId === "number") {
    return { id: slugOrId };
  } else if (containsOnlyDigits(slugOrId)) {
    return { id: parseInt(slugOrId, 10) };
  } else {
    return { slug: slugOrId };
  }
}
