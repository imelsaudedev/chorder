import { renderHook, act } from '@testing-library/react';
import useSong from './useSong';
import { Song, SongArrangement } from '@/models/song';
import { SongUnit } from '@/models/song-unit';

function createSong() {
  const arrangements = [
    ['A', 'D', 'E'],
    ['G', 'C', 'D'],
    ['C', 'F', 'G'],
  ].map(([chord1, chord2, chord3], index) => {
    return new SongArrangement({
      key: chord1,
      units: [1, 2, 3].map(
        (id) =>
          new SongUnit({
            content: [1, 2, 3, 4].map(() => `[${chord1}]Blabla [${chord2}]bla [${chord3}]bla`).join('\n'),
            type: ['INTRO', 'BLOCK', 'ENDING'][id - 1] as 'INTRO' | 'BLOCK' | 'ENDING',
            internalId: id,
          })
      ),
      songMap: [1, 2, 2, 3],
      lastUnitId: 3,
      isDeleted: index === 0,
      isDefault: index === 1,
    });
  });

  return new Song({
    title: 'Old Title',
    artist: 'Old Artist',
    arrangements,
  });
}

test('should update title', () => {
  const song = createSong();
  const { result } = renderHook(() => useSong(song, 1));
  expect(result.current.title).toBe('Old Title');
  act(() => {
    result.current.setTitle('New Title');
    return 0;
  });
  expect(result.current.title).toBe('New Title');
});

test('should update artist', () => {
  const song = createSong();
  const { result } = renderHook(() => useSong(song, 1));
  expect(result.current.artist).toBe('Old Artist');
  act(() => {
    result.current.setArtist('New Artist');
  });
  expect(result.current.artist).toBe('New Artist');
});

test('should update song key', () => {
  const song = createSong();
  const { result } = renderHook(() => useSong(song, 1));
  expect(result.current.songKey).toBe('G');
  ['A', 'G', 'C'].forEach((key, index) => {
    expect(result.current.song.arrangements[index].key).toBe(key);
  });
  act(() => {
    result.current.setSongKey('B');
  });
  expect(result.current.songKey).toBe('B');
  ['A', 'B', 'C'].forEach((key, index) => {
    expect(result.current.song.arrangements[index].key).toBe(key);
  });
});

test('should create a new unit', () => {
  const song = createSong();
  const { result } = renderHook(() => useSong(song, 2));
  expect(result.current.units.length).toBe(3);
  [3, 3, 3].forEach((expectedLength, index) => {
    expect(result.current.song.arrangements[index].units.length).toBe(expectedLength);
  });
  act(() => {
    result.current.createUnit();
  });
  expect(result.current.units.length).toBe(4);
  expect(result.current.song.arrangements[2].units[3].content).toBe('');
  [3, 3, 4].forEach((expectedLength, index) => {
    expect(result.current.song.arrangements[index].units.length).toBe(expectedLength);
    for (let i = 0; i < expectedLength; i++) {
      expect(result.current.song.arrangements[index].units[i].internalId).toBe(i + 1);
    }
  });
});

test('should move unit up', () => {
  const song = createSong();
  const { result } = renderHook(() => useSong(song, 1));
  (
    [
      [[1, 2, 3, 2], 3],
      [[1, 3, 2, 2], 2],
      [[3, 1, 2, 2], 1],
      [[3, 1, 2, 2], 0],
      [[3, 1, 2, 2], -1],
      [[3, 1, 2, 2], 4],
      [[3, 1, 2, 2], 5],
    ] as [number[], number][]
  ).forEach(([expectedSongMap, index]) => {
    act(() => {
      result.current.moveUnitUp(index);
    });
    expect(result.current.songMap).toEqual(expectedSongMap);
    expect(result.current.song.arrangements[1].songMap).toEqual(expectedSongMap);
  });
});

test('should move unit down', () => {
  const song = createSong();
  const { result } = renderHook(() => useSong(song, 1));
  (
    [
      [[1, 2, 2, 3], -1],
      [[2, 1, 2, 3], 0],
      [[2, 2, 1, 3], 1],
      [[2, 2, 3, 1], 2],
      [[2, 2, 3, 1], 3],
    ] as [number[], number][]
  ).forEach(([expectedSongMap, index]) => {
    act(() => {
      result.current.moveUnitDown(index);
    });
    expect(result.current.songMap).toEqual(expectedSongMap);
    expect(result.current.song.arrangements[1].songMap).toEqual(expectedSongMap);
  });
});

test('should remove a unit', () => {
  const song = createSong();
  const { result } = renderHook(() => useSong(song, 1));
  act(() => {
    result.current.buildRemoveUnitHandler(1)();
  });
  const expectedSongMap = [1, 2, 3];
  const arrangement = result.current.song.arrangements[1];
  expect(result.current.songMap).toEqual(expectedSongMap);
  expect(result.current.units).toHaveLength(3);
  expect(arrangement.songMap).toEqual(expectedSongMap);
  expect(arrangement.units).toHaveLength(3);
});

test('should delete unit if all occurrences in the song map are removed', () => {
  const song = createSong();
  const { result } = renderHook(() => useSong(song, 1));
  act(() => {
    result.current.buildRemoveUnitHandler(0)();
  });
  const expectedSongMap = [2, 2, 3];
  const expectedUnitIds = [2, 3];
  const arrangement = result.current.song.arrangements[1];
  expect(result.current.songMap).toEqual(expectedSongMap);
  expect(result.current.units.map((unit) => unit.internalId)).toEqual(expectedUnitIds);
  expect(arrangement.songMap).toEqual(expectedSongMap);
  expect(arrangement.units).toHaveLength(2);
  expect(arrangement.units.map((unit) => unit.internalId)).toEqual(expectedUnitIds);
});

test('should update a unit', () => {
  const song = createSong();
  const { result } = renderHook(() => useSong(song, 2));
  const index = 1;
  const newContent = '[C#]New [G#]Content';
  const newUnit = new SongUnit({
    content: newContent,
    type: 'CHORUS',
    internalId: result.current.units[index].internalId,
  });
  act(() => {
    result.current.buildUpdateUnitHandler(index)(newUnit);
  });
  const previousContent = [1, 2, 3, 4].map(() => '[C]Blabla [F]bla [G]bla').join('\n');
  [
    { content: previousContent, type: 'INTRO', internalId: 1 },
    { content: newContent, type: 'CHORUS', internalId: 2 },
    { content: previousContent, type: 'ENDING', internalId: 3 },
  ].forEach((expectedUnit, index) => {
    expect(result.current.units[index].content).toBe(expectedUnit.content);
    expect(result.current.units[index].type).toBe(expectedUnit.type);
    expect(result.current.units[index].internalId).toBe(expectedUnit.internalId);
    expect(result.current.songMap).toEqual([1, 2, 2, 3]);
    expect(result.current.song.arrangements[2].units[index].content).toBe(expectedUnit.content);
    expect(result.current.song.arrangements[2].units[index].type).toBe(expectedUnit.type);
    expect(result.current.song.arrangements[2].units[index].internalId).toBe(expectedUnit.internalId);
    expect(result.current.song.arrangements[2].songMap).toEqual([1, 2, 2, 3]);
  });
});
