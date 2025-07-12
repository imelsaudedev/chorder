import { PrismaClient } from "@/generated/prisma";
import axios from "axios";
import { DateTime } from "luxon";
import { getChords, getKeyFromChords, getLyrics } from "../../chopro/music";
import { slugFor } from "../data";
import { ClientSong } from "../models";

type LegacySong = {
  id: number;
  filename: string;
  chopro: string;
};

type LegacySongUnit = {
  type: string;
  content: string;
  order: number;
};

type LegacyPlaylist = {
  id: number;
  name: string;
  songs: string[];
};

type LegacyPlaylistSong = {
  id: number;
  transpose: number;
  index: number;
  song: string;
};

const WORSHIP_LEADERS = [
  "Tiago e Ângela",
  "Ângela e Tiago",
  "Ângela e Solange",
  "Tiago",
  "Ângela",
  "Nogi",
  "Hugo",
  "Riva",
  "Solange",
  "Felipe",
  "Deco",
  "Camila",
  "Okoshi",
  "Ezequiel",
];

export async function addNewSongs(prisma: PrismaClient) {
  const response = await axios.get("https://imelsaude.org.br/cifras/api/");
  let allSongsData = (await response.data) as LegacySong[];

  const songsWithLegacyId = await prisma.song.findMany({
    where: { legacyId: { not: null } },
    select: { legacyId: true },
  });
  const existingIds = songsWithLegacyId.map((song) => song.legacyId);

  allSongsData = allSongsData.filter(
    (song) => !existingIds.includes(song.id) && song.filename !== "deletar"
  );
  console.log(
    `Adding ${allSongsData.length} new songs. ${existingIds.length} already exist.`
  );

  const songsWithSlug = await prisma.song.findMany({
    select: { slug: true },
  });
  const slugs = songsWithSlug.map((song) => song.slug);

  await Promise.all(
    allSongsData.map(async (song) => {
      const { title, artist, key, units, lyrics } = parseChordProData(song);
      return prisma.song.create({
        data: {
          legacyId: song.id,
          title,
          slug: await slugFor(title, slugs),
          artist,
          lyrics,
          isDeleted: false,
          arrangements: {
            create: [
              {
                key,
                isDefault: true,
                isDeleted: false,
                isServiceArrangement: false,
                units: {
                  createMany: {
                    data: units.map((unit) => ({
                      content: unit.content.trim(),
                      type: unit.type as any,
                      order: unit.order,
                    })),
                  },
                },
              },
            ],
          },
        },
      });
    })
  );
}

function parseChordProData(legacySong: LegacySong) {
  const chopro = legacySong.chopro;
  const lines = chopro.split("\n");

  let songTitle = legacySong.filename || "";
  let songArtist = "";
  let songKey;
  let order = 1;
  let currentUnit = {
    type: "BLOCK",
    content: "",
    order,
  };
  let units: LegacySongUnit[] = [currentUnit];
  for (let line of lines) {
    // Pattern is {tag: value}
    const tagValue = line.match(/\{(.*?):(.*?)\}/);
    if (tagValue) {
      const tag = tagValue[1].trim();
      const value = tagValue[2].trim();
      if (["title", "t"].includes(tag)) {
        songTitle = value;
      } else if (["Composer", "composer", "artist", "a", "st"].includes(tag)) {
        songArtist = value;
      } else if (["key", "k"].includes(tag)) {
        songKey = value;
      } else if (tag === "sov") {
        order++;
        currentUnit = {
          type: "VERSE",
          content: value,
          order,
        };
        units.push(currentUnit);
      } else {
        currentUnit.content += line + "\n";
      }
    } else {
      const tagMatch = line.match(/\{(.*?)\}/);
      if (tagMatch) {
        const tag = tagMatch[1].trim();
        if (["start_of_intro"].includes(tag)) {
          order++;
          currentUnit = {
            type: "INTRO",
            content: "",
            order,
          };
          units.push(currentUnit);
        } else if (["start_of_chorus", "soc"].includes(tag)) {
          order++;
          currentUnit = {
            type: "CHORUS",
            content: "",
            order,
          };
          units.push(currentUnit);
        } else if (["start_of_verse", "start_of_Verse", "sov"].includes(tag)) {
          order++;
          currentUnit = {
            type: "VERSE",
            content: "",
            order,
          };
          units.push(currentUnit);
        } else if (["start_of_exit", "soe"].includes(tag)) {
          order++;
          currentUnit = {
            type: "ENDING",
            content: "",
            order,
          };
          units.push(currentUnit);
        } else if (["start_of_interlude"].includes(tag)) {
          order++;
          currentUnit = {
            type: "INTERLUDE",
            content: "",
            order,
          };
          units.push(currentUnit);
        } else if (["start_of_bridge", "sob"].includes(tag)) {
          order++;
          currentUnit = {
            type: "BRIDGE",
            content: "",
            order,
          };
          units.push(currentUnit);
        } else if (
          tag.startsWith("end_of_") ||
          ["eoc", "eov", "eob", "sot", "eot"].includes(tag)
        ) {
          order++;
          currentUnit = {
            type: "BLOCK",
            content: "",
            order,
          };
          units.push(currentUnit);
        } else {
          currentUnit.content += `{c: ${tag}}\n`;
        }
      } else if (line.trim().length === 0) {
        order++;
        currentUnit = {
          type: "BLOCK",
          content: "",
          order,
        };
        units.push(currentUnit);
      } else {
        currentUnit.content += line + "\n";
      }
    }
  }

  const lyrics = units
    .map((unit) => unit.content)
    .map((chopro) => getLyrics(chopro))
    .join("\n")
    .trim();

  return {
    title: songTitle,
    artist: songArtist,
    key: songKey || estimateKey(units),
    units,
    lyrics,
  };
}

function estimateKey(units: { content: string }[]) {
  const allChords = getChords(
    units
      .map((unit) => unit.content)
      .join("\n")
      .trim()
  );
  return getKeyFromChords(allChords) || "";
}

export async function addNewServices(prisma: PrismaClient) {
  const playlistResponse = await axios.get(
    "https://imelsaude.org.br/cifras/api/playlist"
  );
  const legacyPlaylistsData = (await playlistResponse.data) as LegacyPlaylist[];

  const playlistSongsResponse = await axios.get(
    "https://imelsaude.org.br/cifras/api/playlist-song"
  );
  const legacyPlaylistSongsData =
    (await playlistSongsResponse.data) as LegacyPlaylistSong[];
  const legacyPlaylistSongById = groupById(
    legacyPlaylistSongsData,
    (song) => song.id
  );

  const songsByLegacyId = await prisma.song
    .findMany({
      where: { legacyId: { not: null } },
      include: { arrangements: { include: { units: true } } },
    })
    .then((songs) => {
      return groupById(songs, (song) => song.legacyId as number);
    });

  const servicesWithSlug = await prisma.service.findMany({
    select: { slug: true },
  });
  const slugs = servicesWithSlug.map((service) => service.slug);
  const originalSlugs = [...slugs];

  let playlists = [];
  for (let legacyPlaylist of legacyPlaylistsData) {
    const date = extractDate(legacyPlaylist.name);
    if (!date) {
      console.log(
        `Ignoring ${legacyPlaylist.name} because it has no valid date.`
      );
      continue;
    }

    const units = await getUnits(
      prisma,
      legacyPlaylist.songs,
      legacyPlaylistSongById,
      songsByLegacyId
    );
    if (units.length === 0) {
      console.log(
        `Ignoring ${legacyPlaylist.name} because it has no valid songs.`
      );
      continue;
    }

    const worshipLeader = extractLeader(legacyPlaylist.name);
    const title =
      extractTitle(legacyPlaylist.name, worshipLeader, date) ??
      "Culto dominical";
    const slug = await slugFor(getTitleForSlug(date), slugs);

    playlists.push({
      legacyId: legacyPlaylist.id,
      title,
      slug,
      date,
      worshipLeader,
      isDeleted: false,
      units: {
        createMany: {
          data: units,
        },
      },
    });
  }
  playlists.sort((a, b) => a.date.getTime() - b.date.getTime());

  const existingIds = await prisma.service
    .findMany({
      where: {
        legacyId: { not: null },
      },
      select: { legacyId: true },
    })
    .then((services) => {
      return services.map((service) => service.legacyId as number);
    });
  console.log(
    `Found ${JSON.stringify(slugs.sort())} existing services with legacyId.`
  );

  playlists = playlists.filter((service) => {
    if (
      existingIds.includes(service.legacyId) ||
      originalSlugs.includes(service.slug)
    ) {
      slugs.slice(slugs.indexOf(service.slug), 1);
      return false;
    }
    return true;
  });
  console.log(
    `Adding ${playlists.length} new services. ${existingIds.length} already exist.`
  );

  if (playlists.length === 0) {
    console.log("No playlists to add to database");
    return;
  }

  for (const playlist of playlists) {
    await prisma.service.create({
      data: playlist,
    });
  }
  console.log(`Added ${playlists.length} new services from the legacy server.`);
}

function extractDate(name: string) {
  name = name.trim();
  if (name === "DED 2020") {
    return newDate(2020, 1, 21);
  } else if (name === "Natal 2022") {
    return newDate(2022, 11, 11);
  } else if (name.startsWith("Retiro de")) {
    if (name.endsWith("Deco")) {
      return newDate(2023, 3, 29);
    } else if (name.endsWith("Okoshi")) {
      return newDate(2023, 3, 30);
    } else if (name.endsWith("Camila")) {
      return newDate(2023, 4, 1);
    }
  } else if (name === "2024 - EBF Crianças") {
    return newDate(2024, 6, 5);
  } else if (name.startsWith("EBF de Adolescentes 2024")) {
    return newDate(2024, 7, 13);
  }

  const formats = [
    {
      regex: /(\d{2})[-/. ](\d{2})[-/. ](\d{4})/,
      parse: (match: RegExpMatchArray) => ({
        day: parseInt(match[1]),
        month: parseInt(match[2]),
        year: parseInt(match[3]),
      }),
    },
    {
      regex: /(\d{4})[-/. ](\d\d?)[-/. ](\d\d?)/,
      parse: (match: RegExpMatchArray) => ({
        year: parseInt(match[1]),
        month: parseInt(match[2]),
        day: parseInt(match[3]),
      }),
    },
    {
      regex: /(\d\d?)[-/. ](\d\d?)[-/. ](\d{2})/,
      parse: (match: RegExpMatchArray) => ({
        day: parseInt(match[1]),
        month: parseInt(match[2]),
        year: parseInt(match[3]) + 2000,
      }),
    },
    {
      regex: /(\d{4})(\d{2})(\d{2})/,
      parse: (match: RegExpMatchArray) => ({
        year: parseInt(match[1]),
        month: parseInt(match[2]),
        day: parseInt(match[3]),
      }),
    },
  ];
  for (const format of formats) {
    const match = name.match(format.regex);
    if (match) {
      const { year, month, day } = format.parse(match);
      return newDate(year, month, day);
    }
  }
  return null;
}

function extractLeader(name: string) {
  name = name.trim();
  for (const leader of WORSHIP_LEADERS) {
    if (name.toLowerCase().includes(leader.toLowerCase())) {
      return leader;
    }
  }
  return null;
}

function extractTitle(name: string, worshipLeader: string | null, date: Date) {
  const original = name;
  name = name
    .replace(/\d+[-/. ]\d+[-/. ]\d+/, "")
    .replace("(", "")
    .replace(")", "")
    .replace(/\s*-\s*/, "");
  if (worshipLeader) {
    name = name.replace(new RegExp(worshipLeader, "i"), "");
  }
  name = name.trim();
  if (
    !name ||
    ["4ºDom", "Liturgia", "Louvor", "Sequência Músicas"].includes(name)
  ) {
    return null;
  }
  if (name === "2024EBF Crianças") {
    return "EBF Crianças 2024";
  } else if (name.toLowerCase() === "retiro de jovens") {
    return "Retiro de Jovens 2023";
  } else if (original.trim() === "04/12/2022 - Okoshi (Natal)") {
    return "Natal Crianças 2022";
  } else if (original.trim() === "12/12/21 (Tiago) - Natal") {
    return "Natal 2021";
  }
  return name;
}

function getTitleForSlug(date: Date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function groupById<T>(data: T[], getId: (item: T) => number) {
  return data.reduce((acc, item) => {
    acc[getId(item)] = item;
    return acc;
  }, {} as { [key: number]: T });
}

async function getUnits(
  prisma: PrismaClient,
  legacyPlaylistSongURLs: string[],
  legacyPlaylistSongById: Record<number, LegacyPlaylistSong>,
  songsByLegacyId: Record<number, ClientSong>
) {
  return (
    await Promise.all(
      legacyPlaylistSongURLs.map(async (url, idx) => {
        const urlParts = url.split("/");
        const id = parseInt(urlParts[urlParts.length - 2]);
        const legacyPlaylistSong = legacyPlaylistSongById[id];
        if (!legacyPlaylistSong) {
          console.error(`Song not found (${id}): ${url}`);
          return null;
        }
        const legacyUrlParts = legacyPlaylistSong.song.split("/");
        const songId = parseInt(legacyUrlParts[legacyUrlParts.length - 2]);
        const song = songsByLegacyId[songId];
        if (!song) {
          console.error(
            `Song not found (${songId}): ${legacyPlaylistSong.song}`
          );
          return null;
        }
        const defaultArrangement = song.arrangements!.find(
          (arrangement) => arrangement.isDefault
        );
        if (!defaultArrangement) {
          console.error(`Song has no default arrangement: ${song.title}`);
          return null;
        }
        if (defaultArrangement.units!.length === 0) {
          console.error(`Song has no units: ${song.title}`);
          return null;
        }

        const arrangement = await prisma.songArrangement.create({
          data: {
            key: defaultArrangement.key,
            songId: song.id!,
            isDefault: false,
            isDeleted: false,
            isServiceArrangement: true,
            units: {
              createMany: {
                data: defaultArrangement.units!.map((unit) => ({
                  content: unit.content.trim(),
                  type: unit.type as any,
                  order: unit.order,
                })),
              },
            },
          },
        });

        return {
          type: "SONG" as const,
          semitoneTranspose: legacyPlaylistSong.transpose,
          order: idx + 1,
          arrangementId: arrangement.id,
        };
      })
    )
  ).filter((unit) => unit !== null);
}

function newDate(year: number, month: number, day: number) {
  let yearStr;
  if (year < 100) {
    yearStr = `20${year.toString().padStart(2, "0")}`;
  } else {
    yearStr = year.toString();
  }
  const monthStr = month.toString().padStart(2, "0");
  const dayStr = day.toString().padStart(2, "0");
  return DateTime.fromFormat(
    `${yearStr}-${monthStr}-${dayStr} 10:00`,
    "yyyy-MM-dd HH:mm",
    {
      zone: "America/Sao_Paulo",
    }
  ).toJSDate();
}
