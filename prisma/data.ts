import prisma from "./client";

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
  const linesWithSearch = lyricsLines
    .map((line, index) => [index, line] as [number, string])
    .filter(
      ([index, line]) =>
        index > 0 && line.toLowerCase().includes(query.toLowerCase())
    );
  let prevLine = 0;
  for (const [index, line] of linesWithSearch) {
    if (lineLimit <= 0) break;
    if (index - prevLine > 1) {
      includedLines.push("...");
      lineLimit--;
    }
    includedLines.push(line);
    lineLimit--;
    prevLine = index;
  }
  return lineLimit;
}
