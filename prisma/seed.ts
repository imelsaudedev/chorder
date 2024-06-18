import { PrismaClient } from '@prisma/client'
import fetch from 'node-fetch';
import { getChords, getKeyFromChords, getLyrics } from '@/chopro/music';

const prisma = new PrismaClient()

type LegacySong = {
  id: number;
  filename: string;
  chopro: string;
};

type LegacySongUnit = {
  type: "SONG_INTRO" | "SONG_ENDING" | "SONG_VERSE" | "SONG_PRECHORUS" | "SONG_CHORUS" | "SONG_BRIDGE" | "SONG_INTERLUDE" | "SONG_SOLO" | "SONG_BLOCK";
  content: string;
}

async function main() {
  const response = await fetch("https://imelsaude.org.br/cifras/api/");
  const allSongs = await response.json() as LegacySong[];

  for (let songData of allSongs) {
    const choproData = parseChordProData(songData);
    await prisma.dBSong.create({
      data: {
        title: choproData.title,
        artist: choproData.artist,
        lyrics: choproData.lyrics,
        arrangements: {
          create: [
            {
              key: choproData.key,
              units: {
                create: choproData.units.map((unit, index) => ({
                  indexInArrangement: index,
                  unit: {
                    create: {
                      type: unit.type,
                      content: unit.content
                    }
                  }
                }))
              },
            }
          ]
        }
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

function parseChordProData(legacySong: LegacySong) {
  const chopro = legacySong.chopro;
  const lines = chopro.split("\n");

  let songTitle = legacySong.filename || "";
  let songArtist = "";
  let songKey;
  let currentUnit: LegacySongUnit = {
    type: "SONG_BLOCK",
    content: ""
    }
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
        currentUnit = {
          type: "SONG_VERSE",
          content: value
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
            type: "SONG_INTRO",
            content: ""
          };
          units.push(currentUnit);
        } else if (["start_of_chorus", "soc"].includes(tag)) {
          currentUnit = {
            type: "SONG_CHORUS",
            content: ""
          };
          units.push(currentUnit);
        } else if (["start_of_verse", "start_of_Verse", "sov"].includes(tag)) {
          currentUnit = {
            type: "SONG_VERSE",
            content: ""
          };
          units.push(currentUnit);
        } else if (["start_of_exit", "soe"].includes(tag)) {
          currentUnit = {
            type: "SONG_ENDING",
            content: ""
          };
          units.push(currentUnit);
        } else if (["start_of_interlude"].includes(tag)) {
          currentUnit = {
            type: "SONG_INTERLUDE",
            content: ""
          };
          units.push(currentUnit);
        } else if (["start_of_bridge", "sob"].includes(tag)) {
          currentUnit = {
            type: "SONG_BRIDGE",
            content: ""
          };
          units.push(currentUnit);
        } else if (tag.startsWith("end_of_") || ["eoc", "eov", "eob", "sot", "eot"].includes(tag)) {
          currentUnit = {
            type: "SONG_BLOCK",
            content: ""
          };
          units.push(currentUnit);
        } else {
          currentUnit.content += `{c: ${tag}}\n`;
        }
      } else if (line.trim().length === 0) {
        currentUnit = {
          type: "SONG_BLOCK",
          content: ""
        };
        units.push(currentUnit);
      } else {
        currentUnit.content += line + "\n";
      }
    }
  }

  units = units.map(unit => ({ ...unit, content: unit.content.trim() })).filter(unit => unit.content.length > 0);
  const lyrics = units.map(unit => unit.content).map(chopro => getLyrics(chopro)).join("\n").trim();

  return {
    title: songTitle,
    artist: songArtist,
    key: songKey || estimateKey(units),
    units,
    lyrics,
  };
}

function estimateKey(units: LegacySongUnit[]) {
  const allChords = getChords(units.map(unit => unit.content).join("\n").trim());
  return getKeyFromChords(allChords) || "";
}
