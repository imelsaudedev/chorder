import { Song } from './song';
import { SongArrangement } from './song-arrangement';
import { SongUnit, SongUnitType } from './song-unit';

export function newSongUnit({
  content,
  internalId,
  type,
}: {
  content: string;
  internalId: number;
  type?: SongUnitType;
}): SongUnit {
  return {
    content,
    internalId,
    type: type || 'BLOCK',
  };
}

export function newSongArrangement({
  key,
  units,
  songMap,
  isDefault,
  isDeleted,
  lastUnitId,
  semitoneTranspose,
}: {
  key?: string;
  units?: SongUnit[];
  songMap?: number[];
  isDefault?: boolean;
  isDeleted?: boolean;
  lastUnitId?: number;
  semitoneTranspose?: number;
}): SongArrangement {
  return {
    key: key || 'C',
    units: units || [
      newSongUnit({ content: '[C]First [G]line', internalId: 1 }),
      newSongUnit({ content: '[C]Then the se[F]cond', internalId: 2 }),
    ],
    songMap: songMap || [1, 2, 1],
    isDefault: isDefault || false,
    isDeleted: isDeleted || false,
    lastUnitId: lastUnitId || 2,
    semitoneTranspose: semitoneTranspose || 0,
  };
}

export function newSong({
  title = 'Test Song',
  artist = 'Test Artist',
  lyrics = 'Test lyrics',
  arrangements,
  currentArrangementId,
  isDeleted = false,
}: {
  title?: string;
  artist?: string;
  lyrics?: string;
  arrangements?: SongArrangement[];
  currentArrangementId?: number;
  isDeleted?: boolean;
}): Song {
  return {
    slug: title.toLowerCase().replace(/ /g, '-'),
    title,
    artist,
    lyrics,
    arrangements: arrangements || [newSongArrangement({ isDefault: true })],
    currentArrangementId,
    isDeleted,
  };
}
