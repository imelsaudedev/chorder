import { renderHook, act } from '@testing-library/react';
import { groupSongsByFirstLetter, Song, SongArrangement } from '@/models/song';
import { SongUnit } from '@/models/song-unit';

describe('song', () => {
  it('should construct a song with default arguments', () => {
    const song = new Song({});
    expect(song.title).toBe('');
    expect(song.artist).toBe(null);
    expect(song.arrangements).toEqual([]);
    expect(song.isDeleted).toBe(false);
  });

  it('should construct a song with the given arguments', () => {
    const song = new Song({
      title: 'Test Song',
      artist: 'Test Artist',
      arrangements: [new SongArrangement({})],
      isDeleted: true,
    });
    expect(song.title).toBe('Test Song');
    expect(song.artist).toBe('Test Artist');
    expect(song.arrangements).toEqual([new SongArrangement({})]);
    expect(song.isDeleted).toBe(true);
  });

  it('should serialize and deserialize a song', () => {
    const song = new Song({
      title: 'Test Song',
      slug: 'test-song',
      artist: 'Test Artist',
      arrangements: [new SongArrangement({})],
      isDeleted: true,
    });
    const serialized = song.serialize();
    const deserialized = Song.deserialize(serialized);
    expect(deserialized).toEqual(song);
  });

  it('should return the default arrangement if invalid arrangementId is passed', () => {
    const defaultArrangement = new SongArrangement({ isDefault: true });
    const otherArrangement = new SongArrangement({ isDefault: false });
    const song = new Song({
      title: 'Test Song',
      arrangements: [otherArrangement, defaultArrangement],
    });
    expect(song.getArrangementOrDefault(null)).toBe(defaultArrangement);
    expect(song.getArrangementOrDefault(123)).toBe(defaultArrangement);
    expect(song.getArrangementOrDefault(1)).toBe(defaultArrangement);
    expect(song.getArrangementOrDefault(0)).toBe(otherArrangement);
  });

  it('should return the default arrangement even if it is not the first one', () => {
    const defaultArrangement = new SongArrangement({ isDefault: true });
    const otherArrangement = new SongArrangement({ isDefault: false });
    const song = new Song({
      title: 'Test Song',
      arrangements: [otherArrangement, defaultArrangement],
    });
    expect(song.defaultArrangement).toBe(defaultArrangement);
  });

  it('removes the arrangement and sets the next one as default if the removed one was default', () => {
    const deletedArrangement = new SongArrangement({ isDefault: false, isDeleted: true });
    const defaultArrangement = new SongArrangement({ isDefault: true });
    const otherArrangement = new SongArrangement({ isDefault: false });
    const song = new Song({
      title: 'Test Song',
      arrangements: [defaultArrangement, deletedArrangement, otherArrangement],
    });
    song.removeArrangement(0);
    expect(song.arrangements[0].isDeleted).toBe(true);
    expect(song.arrangements[1].isDeleted).toBe(true);
    expect(song.arrangements[2].isDeleted).toBe(false);

    expect(song.arrangements[0].isDefault).toBe(false);
    expect(song.arrangements[1].isDefault).toBe(false);
    expect(song.arrangements[2].isDefault).toBe(true);
  });

  it('removes the arrangement and does not change the default if the removed one was not default', () => {
    const deletedArrangement = new SongArrangement({ isDefault: false, isDeleted: true });
    const defaultArrangement = new SongArrangement({ isDefault: true });
    const otherArrangement = new SongArrangement({ isDefault: false });
    const song = new Song({
      title: 'Test Song',
      arrangements: [deletedArrangement, otherArrangement, defaultArrangement],
    });
    song.removeArrangement(1);
    expect(song.arrangements[0].isDeleted).toBe(true);
    expect(song.arrangements[1].isDeleted).toBe(true);
    expect(song.arrangements[2].isDeleted).toBe(false);

    expect(song.arrangements[0].isDefault).toBe(false);
    expect(song.arrangements[1].isDefault).toBe(false);
    expect(song.arrangements[2].isDefault).toBe(true);
  });
});

describe('song arrangement', () => {
  it('should construct a song arrangement with default arguments', () => {
    const arrangement = new SongArrangement({});
    expect(arrangement.isDefault).toBe(false);
    expect(arrangement.isDeleted).toBe(false);
  });

  it('should construct a song arrangement with the given arguments', () => {
    const arrangement = new SongArrangement({
      isDefault: true,
      isDeleted: true,
    });
    expect(arrangement.isDefault).toBe(true);
    expect(arrangement.isDeleted).toBe(true);
  });

  it('should serialize and deserialize a song arrangement', () => {
    const arrangement = new SongArrangement({
      isDefault: true,
      isDeleted: true,
    });
    const serialized = arrangement.serialize();
    const deserialized = SongArrangement.deserialize(serialized);
    expect(deserialized).toEqual(arrangement);
  });

  it('should compute the key if not provided', () => {
    const arrangement = new SongArrangement({
      units: [
        new SongUnit({ content: '[C]Test [G]content', internalId: 1 }),
        new SongUnit({ content: '[C]Test [F]content', internalId: 2 }),
      ],
    });
    expect(arrangement.key).toBe('C');
  });

  it('should not compute the key if provided', () => {
    const arrangement = new SongArrangement({
      key: 'G',
      units: [
        new SongUnit({ content: '[C]Test [G]content', internalId: 1 }),
        new SongUnit({ content: '[C]Test [F]content', internalId: 2 }),
      ],
    });
    expect(arrangement.key).toBe('G');
  });

  it('computes the lyrics from the units', () => {
    const arrangement = new SongArrangement({
      units: [
        new SongUnit({ content: '[C]First [G]line', internalId: 1 }),
        new SongUnit({ content: '[C]Then the se[F]cond', internalId: 2 }),
      ],
    });
    expect(arrangement.lyrics).toBe('First line\nThen the second');
  });
});

describe('helper functions', () => {
  it('should group songs by first letter', () => {
    const songs = [
      new Song({ title: 'Test Song 1' }),
      new Song({ title: 'Another Song' }),
      new Song({ title: 'Água' }),
      new Song({ title: 'Important Song' }),
      new Song({ title: 'Test Song 2' }),
      new Song({ title: 'Ímpar' }),
      new Song({ title: 'Our Song' }),
      new Song({ title: 'Ótica' }),
      new Song({ title: 'Ônibus' }),
      new Song({ title: 'À Você' }),
    ];
    const grouped = groupSongsByFirstLetter(songs);
    expect(grouped.get('a')).toEqual([songs[1], songs[2], songs[9]]);
    expect(grouped.get('i')).toEqual([songs[3], songs[5]]);
    expect(grouped.get('o')).toEqual([songs[6], songs[7], songs[8]]);
    expect(grouped.get('t')).toEqual([songs[0], songs[4]]);
  });
});
