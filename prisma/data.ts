import prisma from "./client";
import {
  ClientSongUnit,
  SongArrangement,
  SongArrangementWithSong,
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
  return slugFor(title, slugs);
}

export async function slugForService(title: string) {
  const slugs = await retrieveSongSlugs();
  return slugFor(title, slugs);
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

type RetrieveSongsArgs = {
  query?: string;
  limitLines?: number;
  forceIncludeFirstLine?: boolean;
};
export async function retrieveSongs({
  query = "",
  limitLines,
  forceIncludeFirstLine = true,
}: RetrieveSongsArgs) {
  let songs = await prisma.song.findMany({
    where: {
      isDeleted: false,
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
    omit: { id: true, legacyId: true },
  });
  if (limitLines) {
    songs = songs.map((song) =>
      limitLyrics(song, limitLines, forceIncludeFirstLine, query)
    );
  }
  return songs;
}

export async function retrieveSong(slug: string) {
  return prisma.song.findFirst({
    where: {
      slug,
      isDeleted: false,
    },
  });
}

export async function retrieveSongArrangements(
  songSlug: string,
  includeUnits: boolean = false
) {
  return prisma.songArrangement.findMany({
    where: {
      song: {
        slug: songSlug,
      },
      isDeleted: false,
    },
    include: {
      units: includeUnits,
    },
  });
}

type RetrieveArrangementArgs = {
  songSlug?: string;
  includeUnits?: boolean;
  includeSong?: boolean;
};
export async function retrieveArrangement(
  arrangementId: number | "default",
  { songSlug, includeUnits, includeSong }: RetrieveArrangementArgs = {}
) {
  if (arrangementId === "default" && !songSlug) {
    throw new Error("Song slug is required to retrieve default arrangement");
  }
  if (arrangementId === "default") {
    return prisma.songArrangement.findFirst({
      where: {
        song: {
          slug: songSlug,
        },
        isDefault: true,
        isDeleted: false,
      },
      include: {
        units: includeUnits,
        song: includeSong,
      },
    });
  }

  const where: {
    id: number;
    isDeleted: boolean;
    song?: { slug: string };
  } = {
    id: parseInt(arrangementId.toString()),
    isDeleted: false,
  };
  if (songSlug) {
    where["song"] = {
      slug: songSlug,
    };
  }

  return prisma.songArrangement.findFirst({
    where,
    include: {
      units: includeUnits,
      song: includeSong,
    },
  });
}

type CreateArrangementWithSongArgs = {
  includeSong?: boolean;
  includeUnits?: boolean;
};
export async function createArrangementWithSong(
  songTitle: string,
  songSlug: string,
  artist: string | null,
  lyrics: string,
  arrangementName: string | null,
  key: string,
  units: ClientSongUnit[],
  {
    includeSong = false,
    includeUnits = false,
  }: CreateArrangementWithSongArgs = {}
) {
  prisma.songArrangement.create({
    data: {
      name: arrangementName,
      key,
      song: {
        connectOrCreate: {
          where: { slug: songSlug },
          create: {
            slug: songSlug,
            title: songTitle,
            artist,
            lyrics,
          },
        },
      },
      units: {
        createMany: {
          data: units,
        },
      },
    },
    include: {
      song: includeSong,
      units: includeUnits,
    },
  });
}

type UpdateArrangementArgs = {
  includeSong?: boolean;
  includeUnits?: boolean;
};
export async function updateArrangement(
  arrangementId: number,
  data: {
    title: string;
    slug: string;
    lyrics: string;
    artist: string | null;
    isDeleted: boolean;
    units?: ClientSongUnit[];
  },
  { includeSong = false, includeUnits = false }: UpdateArrangementArgs = {}
) {
  const { units, ...rest } = data;
  const inputData: typeof rest & { units?: any } = rest;
  if (units) {
    inputData["units"] = {
      deleteMany: {},
      createMany: {
        data: units,
      },
    };
  }
  return prisma.songArrangement.update({
    where: {
      id: arrangementId,
    },
    data: inputData,
    include: {
      song: includeSong,
      units: includeUnits,
    },
  });
}

export async function makeArrangementDefault(arrangementId: number) {
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

export async function moveArrangement(arrangementId: number, songSlug: string) {
  const [song, arrangement] = await Promise.all([
    findSongBySlugWithDefaultArrangement(songSlug),
    findSongArrangementWithSongWithArrangements(arrangementId),
  ]);

  if (!song) throw new Error("Destination song not found");
  if (!arrangement) throw new Error("Arrangement not found");
  if (!arrangement.song) throw new Error("Original song not found");
  const originalSongId = arrangement.song.id;
  const wasDefault = arrangement.isDefault;

  const isDefault = song.arrangements.length === 0;
  await prisma.songArrangement.update({
    where: { id: arrangementId },
    data: { isDefault, songId: song.id },
  });

  if (wasDefault) {
    await updateDefaultArrangement(originalSongId);
  }
}

async function updateDefaultArrangement(songId: number) {
  const originalSong = await findSongByIdWithArrangements(songId);
  if (!originalSong) {
    return;
  }
  if (originalSong.arrangements.length > 0) {
    await prisma.songArrangement.update({
      where: { id: originalSong.arrangements[0].id },
      data: { isDefault: true },
    });
  } else {
    await prisma.song.update({
      where: { id: songId },
      data: { isDeleted: true },
    });
  }
}

export async function deleteArrangement(
  songSlug: string,
  arrangementId: number | "default"
) {
  let songId: number;
  if (arrangementId === "default") {
    const song = await findSongBySlugWithDefaultArrangement(songSlug);
    if (!song) throw new Error("Song not found");
    if (song.arrangements.length === 0) {
      throw new Error("No arrangements to delete");
    }
    const arrangement = await prisma.songArrangement.update({
      where: {
        id: song.arrangements[0].id,
        isDefault: true,
        isDeleted: false,
      },
      data: { isDeleted: true },
      include: {
        song: true,
      },
    });
    songId = song.id;
  } else {
    const arrangement = await prisma.songArrangement.update({
      where: { id: arrangementId },
      data: { isDeleted: true },
      include: {
        song: true,
      },
    });
    if (!arrangement) throw new Error("Arrangement not found");
    if (!arrangement.song) throw new Error("Song not found");
    songId = arrangement.song.id;
  }
  await updateDefaultArrangement(songId);
}

export async function retrieveServices() {
  return prisma.service.findMany({
    where: {
      isDeleted: false,
    },
  });
}

function limitLyrics(
  song: {
    title: string;
    slug: string;
    lyrics: string;
    artist: string | null;
    isDeleted: boolean;
  },
  limitLines: number,
  forceIncludeFirstLine: boolean,
  query: string
) {
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
) {
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

function findSongByIdWithArrangements(originalSongId: number) {
  return prisma.song.findUnique({
    where: { id: originalSongId },
    include: {
      arrangements: {
        where: { isDeleted: false },
      },
    },
  });
}

function findSongArrangementWithSongWithArrangements(arrangementId: number) {
  return prisma.songArrangement.findUnique({
    where: { id: arrangementId },
    include: {
      song: {
        include: {
          arrangements: {
            where: { isDeleted: false },
          },
        },
      },
    },
  });
}

function findSongBySlugWithDefaultArrangement(songSlug: string) {
  return prisma.song.findUnique({
    where: { slug: songSlug },
    include: {
      arrangements: {
        where: { isDefault: true },
      },
    },
  });
}
