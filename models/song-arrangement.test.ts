import { getArrangementLyrics } from './song-arrangement';
import { newSongArrangement, newSongUnit } from './test-utils';

describe('song arrangement', () => {
  it('computes the lyrics from the units', () => {
    const arrangement = newSongArrangement({
      units: [
        newSongUnit({ content: '[C]First [G]line', internalId: 1 }),
        newSongUnit({ content: '[C]Then the se[F]cond', internalId: 2 }),
      ],
    });
    expect(getArrangementLyrics(arrangement)).toBe('First line\nThen the second');
  });
});
