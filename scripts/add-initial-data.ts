import axios from 'axios';
import { getChords, getKeyFromChords, getLyrics } from '../chopro/music';
import { getDB } from '../database/client';
import { MongoBulkWriteError, WriteError } from 'mongodb';

type SongUnit = {
  type: string;
  content: string;
  internalId?: number;
};

type LegacySong = {
  id: number;
  filename: string;
  chopro: string;
};

async function main() {
  const { client, db } = await getDB();

  const response = await axios.get("https://imelsaude.org.br/cifras/api/");
  const allSongsData = await response.data as LegacySong[];
  const slugs: string[] = [];

  const allSongs = allSongsData.map(songData => {
    const choproData = parseChordProData(songData);
    return newSong(choproData.title, slugs, choproData.artist, choproData.lyrics, [newArrangement(
      choproData.key,
      choproData.units,
    )])
  }).filter(song => song.title !== "deletar");

  const session = client.startSession();
  try {
    await session.withTransaction(async () => {
      await db.collection("songs").insertMany(allSongs);
      await db.collection("slugs").insertMany(slugs.map(slug => ({ slug })));
    });
  } catch (error) {
    const err = ((error as MongoBulkWriteError).writeErrors as WriteError[])[0] as WriteError;
    console.error("Error adding initial data", err.err.op);
  } finally {
    await session.endSession();
    await client.close();
  }
}

main();

function parseChordProData(legacySong: LegacySong) {
  const chopro = legacySong.chopro;
  const lines = chopro.split("\n");

  let songTitle = legacySong.filename || "";
  let songArtist = "";
  let songKey;
  let currentUnit = {
    type: "BLOCK",
    content: "",
  };
  let units: SongUnit[] = [currentUnit];
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
        currentUnit = {
          type: "VERSE",
          content: value,
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
          currentUnit = {
            type: "INTRO",
            content: "",
          };
          units.push(currentUnit);
        } else if (["start_of_chorus", "soc"].includes(tag)) {
          currentUnit = {
            type: "CHORUS",
            content: "",
          };
          units.push(currentUnit);
        } else if (["start_of_verse", "start_of_Verse", "sov"].includes(tag)) {
          currentUnit = {
            type: "VERSE",
            content: "",
          };
          units.push(currentUnit);
        } else if (["start_of_exit", "soe"].includes(tag)) {
          currentUnit = {
            type: "ENDING",
            content: "",
          };
          units.push(currentUnit);
        } else if (["start_of_interlude"].includes(tag)) {
          currentUnit = {
            type: "INTERLUDE",
            content: "",
          };
          units.push(currentUnit);
        } else if (["start_of_bridge", "sob"].includes(tag)) {
          currentUnit = {
            type: "BRIDGE",
            content: "",
          };
          units.push(currentUnit);
        } else if (tag.startsWith("end_of_") || ["eoc", "eov", "eob", "sot", "eot"].includes(tag)) {
          currentUnit = {
            type: "BLOCK",
            content: "",
          };
          units.push(currentUnit);
        } else {
          currentUnit.content += `{c: ${tag}}\n`;
        }
      } else if (line.trim().length === 0) {
        currentUnit = {
          type: "BLOCK",
          content: "",
        };
        units.push(currentUnit);
      } else {
        currentUnit.content += line + "\n";
      }
    }
  }

  const lyrics = units.map(unit => unit.content).map(chopro => getLyrics(chopro)).join("\n").trim();

  return {
    title: songTitle,
    artist: songArtist,
    key: songKey || estimateKey(units),
    units,
    lyrics,
  };
}

function estimateKey(units: { content: string }[]) {
  const allChords = getChords(units.map(unit => unit.content).join("\n").trim());
  return getKeyFromChords(allChords) || "";
}

function newSong(title: string, slugs: string[], artist: string | null, lyrics: string, arrangements: any[]) {
  const slug = getAvailableSlug(title, slugs);

  return {
    title,
    slug,
    artist,
    lyrics,
    arrangements,
    isDeleted: false,
  }
}

function newArrangement(key: string, units: SongUnit[]) {
  const { filteredUnits, songMap, lastUnitId } = buildSongMap(units);

  return {
    key,
    units: filteredUnits,
    songMap,
    isDefault: true,
    isDeleted: false,
    lastUnitId,
  }
}

function buildSongMap(units: SongUnit[]) {
  const filteredUnits: SongUnit[] = [];
  const songMap: number[] = [];
  let lastUnitId = 0;
  for (let unit of units) {
    const content = unit.content.trim();
    if (content.length === 0) {
      continue;
    }
    unit.content = content;
    let internalId = lastUnitId + 1;
    if (filteredUnits.some(u => u.content === unit.content)) {
      internalId = filteredUnits.find(u => u.content === unit.content)!.internalId as number;
    } else {
      unit.internalId = internalId;
      lastUnitId = internalId;
      filteredUnits.push(unit);
    }
    songMap.push(internalId);
  }
  return { filteredUnits, songMap, lastUnitId };
}

function getAvailableSlug(original: string, slugs: string[]) {
  let slug = original.trim().toLowerCase().normalize("NFKD").replace(/\p{Diacritic}/gu, "").replace(/[^a-z0-9]/g, "-");
  let idx = 1;
  let newSlug = slug;
  while (slugs.includes(newSlug)) {
    newSlug = `${slug}-${idx}`;
    idx++;
  }
  slugs.push(newSlug);
  return newSlug;
}
