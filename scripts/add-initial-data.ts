import axios from 'axios';
import { getChords, getKeyFromChords, getLyrics } from '../chopro/music';
import { getDB } from '../database/client';
import { MongoBulkWriteError, WriteError } from 'mongodb';
import moment from 'moment-timezone';

type Song = {
  legacyId: number;
  title: string;
  slug: string;
  artist: string | null;
  lyrics: string;
  arrangements: any[];
  isDeleted: boolean;
};

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
  'Tiago e Ângela',
  'Ângela e Tiago',
  'Ângela e Solange',
  'Tiago',
  'Ângela',
  'Nogi',
  'Hugo',
  'Riva',
  'Solange',
  'Felipe',
  'Deco',
  'Camila',
  'Okoshi',
];

async function main() {
  const slugs: string[] = [];
  console.log('Adding songs...');
  await addSongs(slugs);
  console.log('Adding services...');
  await addServices(slugs);
  console.log('Saving slugs...');
  await saveSlugs(slugs);
}

main();

async function addSongs(slugs: string[]) {
  const { client, db } = await getDB();

  const response = await axios.get('https://imelsaude.org.br/cifras/api/');
  let allSongsData = (await response.data) as LegacySong[];

  const existingIds = await db
    .collection('songs')
    .find({ legacyId: { $ne: null } })
    .toArray()
    .then((songs) => {
      return songs.map((song) => song.legacyId).filter((id) => id !== null);
    });
  allSongsData = allSongsData.filter((song) => !existingIds.includes(song.id));
  console.log(`Adding ${allSongsData.length} new songs. ${existingIds.length} already exist.`);

  const allSongs = allSongsData
    .map((songData) => {
      const choproData = parseChordProData(songData);
      return newSong(songData.id, choproData.title, slugs, choproData.artist, choproData.lyrics, [
        newArrangement(choproData.key, choproData.units),
      ]);
    })
    .filter((song) => song.title !== 'deletar');
  slugs.splice(slugs.indexOf('deletar'), 1);

  if (allSongs.length === 0) {
    await client.close();
    console.log('No songs to add to database');
    return;
  }

  const session = client.startSession();
  try {
    await session.withTransaction(async () => {
      await db.collection('songs').insertMany(allSongs);
    });
  } catch (error) {
    const err = ((error as MongoBulkWriteError).writeErrors as WriteError[])[0] as WriteError;
    console.error('Error adding initial song data', err.err.op);
  } finally {
    await session.endSession();
    await client.close();
  }
}

function parseChordProData(legacySong: LegacySong) {
  const chopro = legacySong.chopro;
  const lines = chopro.split('\n');

  let songTitle = legacySong.filename || '';
  let songArtist = '';
  let songKey;
  let currentUnit = {
    type: 'BLOCK',
    content: '',
  };
  let units: SongUnit[] = [currentUnit];
  for (let line of lines) {
    // Pattern is {tag: value}
    const tagValue = line.match(/\{(.*?):(.*?)\}/);
    if (tagValue) {
      const tag = tagValue[1].trim();
      const value = tagValue[2].trim();
      if (['title', 't'].includes(tag)) {
        songTitle = value;
      } else if (['Composer', 'composer', 'artist', 'a', 'st'].includes(tag)) {
        songArtist = value;
      } else if (['key', 'k'].includes(tag)) {
        songKey = value;
      } else if (tag === 'sov') {
        currentUnit = {
          type: 'VERSE',
          content: value,
        };
        units.push(currentUnit);
      } else {
        currentUnit.content += line + '\n';
      }
    } else {
      const tagMatch = line.match(/\{(.*?)\}/);
      if (tagMatch) {
        const tag = tagMatch[1].trim();
        if (['start_of_intro'].includes(tag)) {
          currentUnit = {
            type: 'INTRO',
            content: '',
          };
          units.push(currentUnit);
        } else if (['start_of_chorus', 'soc'].includes(tag)) {
          currentUnit = {
            type: 'CHORUS',
            content: '',
          };
          units.push(currentUnit);
        } else if (['start_of_verse', 'start_of_Verse', 'sov'].includes(tag)) {
          currentUnit = {
            type: 'VERSE',
            content: '',
          };
          units.push(currentUnit);
        } else if (['start_of_exit', 'soe'].includes(tag)) {
          currentUnit = {
            type: 'ENDING',
            content: '',
          };
          units.push(currentUnit);
        } else if (['start_of_interlude'].includes(tag)) {
          currentUnit = {
            type: 'INTERLUDE',
            content: '',
          };
          units.push(currentUnit);
        } else if (['start_of_bridge', 'sob'].includes(tag)) {
          currentUnit = {
            type: 'BRIDGE',
            content: '',
          };
          units.push(currentUnit);
        } else if (tag.startsWith('end_of_') || ['eoc', 'eov', 'eob', 'sot', 'eot'].includes(tag)) {
          currentUnit = {
            type: 'BLOCK',
            content: '',
          };
          units.push(currentUnit);
        } else {
          currentUnit.content += `{c: ${tag}}\n`;
        }
      } else if (line.trim().length === 0) {
        currentUnit = {
          type: 'BLOCK',
          content: '',
        };
        units.push(currentUnit);
      } else {
        currentUnit.content += line + '\n';
      }
    }
  }

  const lyrics = units
    .map((unit) => unit.content)
    .map((chopro) => getLyrics(chopro))
    .join('\n')
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
      .join('\n')
      .trim()
  );
  return getKeyFromChords(allChords) || '';
}

function newSong(
  id: number,
  title: string,
  slugs: string[],
  artist: string | null,
  lyrics: string,
  arrangements: any[]
) {
  const slug = getAvailableSlug(title, slugs);

  return {
    legacyId: id,
    title,
    slug,
    artist,
    lyrics,
    arrangements,
    isDeleted: false,
  };
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
  };
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
    if (filteredUnits.some((u) => u.content === unit.content)) {
      internalId = filteredUnits.find((u) => u.content === unit.content)!.internalId as number;
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
  let slug = original
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[()]/g, '')
    .replace(/[^a-z0-9]/g, '-');
  let idx = 1;
  let newSlug = slug;
  while (slugs.includes(newSlug)) {
    newSlug = `${slug}-${idx}`;
    idx++;
  }
  slugs.push(newSlug);
  return newSlug;
}

async function addServices(slugs: string[]) {
  const { client, db } = await getDB();

  const playlistResponse = await axios.get('https://imelsaude.org.br/cifras/api/playlist');
  const legacyPlaylistsData = (await playlistResponse.data) as LegacyPlaylist[];

  const playlistSongsResponse = await axios.get('https://imelsaude.org.br/cifras/api/playlist-song');
  const legacyPlaylistSongsData = (await playlistSongsResponse.data) as LegacyPlaylistSong[];
  const legacyPlaylistSongById = groupById(legacyPlaylistSongsData, (song) => song.id);

  const songsByLegacyId = await db
    .collection('songs')
    .find<Song>({ legacyId: { $ne: null } })
    .toArray()
    .then((songs) => {
      return groupById(songs, (song) => song.legacyId);
    });

  let playlists = legacyPlaylistsData
    .map((legacyPlaylist) => {
      const date = extractDate(legacyPlaylist.name);
      if (!date) {
        console.log(`Ignoring ${legacyPlaylist.name} because it has no valid date.`);
        return null;
      }

      const units = getUnits(legacyPlaylist.songs, legacyPlaylistSongById, songsByLegacyId);
      if (units.length === 0) {
        console.log(`Ignoring ${legacyPlaylist.name} because it has no valid songs.`);
        return null;
      }

      const worshipLeader = extractLeader(legacyPlaylist.name);
      const title = extractTitle(legacyPlaylist.name, worshipLeader, date);
      const slug = getAvailableSlug(getTitleForSlug(date), slugs);

      return {
        legacyId: legacyPlaylist.id,
        title,
        slug,
        date,
        worshipLeader,
        isDeleted: false,
        units,
      };
    })
    .filter((playlist) => playlist !== null);
  playlists.sort((a, b) => a.date.getTime() - b.date.getTime());

  const existingIds = await db
    .collection('services')
    .find({ legacyId: { $ne: null } })
    .toArray()
    .then((services) => {
      return services.map((service) => service.legacyId).filter((id) => id !== null);
    });
  playlists = playlists.filter((service) => {
    if (existingIds.includes(service.legacyId)) {
      slugs.slice(slugs.indexOf(service.slug), 1);
      return false;
    }
    return true;
  });
  console.log(`Adding ${playlists.length} new services. ${existingIds.length} already exist.`);

  if (playlists.length === 0) {
    await client.close();
    console.log('No playlists to add to database');
    return;
  }

  const session = client.startSession();
  try {
    await session.withTransaction(async () => {
      await db.collection('services').insertMany(playlists);
    });
  } catch (error) {
    const err = ((error as MongoBulkWriteError).writeErrors as WriteError[])[0] as WriteError;
    console.error('Error adding initial service data', err.err.op);
  } finally {
    await session.endSession();
    await client.close();
  }
}

async function saveSlugs(slugs: string[]) {
  const { client, db } = await getDB();
  await db.collection('slugs').insertMany(slugs.map((slug) => ({ slug })));
  await client.close();
}

function extractDate(name: string) {
  name = name.trim();
  if (name === 'DED 2020') {
    return newDate(2020, 1, 21);
  } else if (name === 'Natal 2022') {
    return newDate(2022, 11, 11);
  } else if (name.startsWith('Retiro de')) {
    if (name.endsWith('Deco')) {
      return newDate(2023, 3, 29);
    } else if (name.endsWith('Okoshi')) {
      return newDate(2023, 3, 30);
    } else if (name.endsWith('Camila')) {
      return newDate(2023, 4, 1);
    }
  } else if (name === '2024 - EBF Crianças') {
    return newDate(2024, 6, 5);
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
      regex: /(\d{4})[-/. ](\d{2})[-/. ](\d{2})/,
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
  ];
  for (const format of formats) {
    const match = name.match(format.regex);
    if (match) {
      const { year, month, day } = format.parse(match);
      return newDate(year, month - 1, day);
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
    .replace(/\d+[-/. ]\d+[-/. ]\d+/, '')
    .replace('(', '')
    .replace(')', '')
    .replace(/\s*-\s*/, '');
  if (worshipLeader) {
    name = name.replace(new RegExp(worshipLeader, 'i'), '');
  }
  name = name.trim();
  if (!name || ['4ºDom', 'Liturgia', 'Louvor', 'Sequência Músicas'].includes(name)) {
    return null;
  }
  if (name === '2024EBF Crianças') {
    return 'EBF Crianças 2024';
  } else if (name.toLowerCase() === 'retiro de jovens') {
    return 'Retiro de Jovens 2023';
  } else if (original.trim() === '04/12/2022 - Okoshi (Natal)') {
    return 'Natal Crianças 2022';
  } else if (original.trim() === '12/12/21 (Tiago) - Natal') {
    return 'Natal 2021';
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

function getUnits(
  legacyPlaylistSongURLs: string[],
  legacyPlaylistSongById: Record<number, LegacyPlaylistSong>,
  songsByLegacyId: Record<number, Song>
) {
  return legacyPlaylistSongURLs
    .map((url) => {
      const urlParts = url.split('/');
      const id = parseInt(urlParts[urlParts.length - 2]);
      const legacyPlaylistSong = legacyPlaylistSongById[id];
      if (!legacyPlaylistSong) {
        console.error(`Song not found (${id}): ${url}`);
        return null;
      }
      const legacyUrlParts = legacyPlaylistSong.song.split('/');
      const songId = parseInt(legacyUrlParts[legacyUrlParts.length - 2]);
      const song = songsByLegacyId[songId];
      if (!song) {
        console.error(`Song not found (${songId}): ${legacyPlaylistSong.song}`);
        return null;
      }
      if (song.arrangements[0].songMap.length === 0) {
        console.error(`Song has no units: ${song.title}`);
        return null;
      }
      return {
        type: 'DB_SONG',
        songSlug: song.slug,
        arrangementId: 0,
        semitoneTranspose: legacyPlaylistSong.transpose,
        additionalSongUnits: [],
        songMap: song.arrangements[0].songMap,
      };
    })
    .filter((unit) => unit !== null);
}

function newDate(year: number, month: number, day: number) {
  return moment.tz(`${year}-${month}-${day} 10:00`, 'America/Sao_Paulo').toDate();
}
