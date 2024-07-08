import { getDefaultArrangement, groupSongsByFirstLetter, removeArrangement, setArrangement } from '@/models/song';
import { newSong, newSongArrangement } from './test-utils';

describe('song', () => {
  it('should return the default arrangement if undefined arrangementId is passed', () => {
    const defaultArrangement = newSongArrangement({ isDefault: true });
    const otherArrangement = newSongArrangement({ isDefault: false });
    let song = newSong({
      arrangements: [otherArrangement, defaultArrangement],
    });
    song.currentArrangementId = undefined;
    song = setArrangement(song);
    expect(song.arrangement).toBe(defaultArrangement);
    song.currentArrangementId = 1;
    song = setArrangement(song);
    expect(song.arrangement).toBe(defaultArrangement);
    song.currentArrangementId = 0;
    song = setArrangement(song);
    expect(song.arrangement).toBe(otherArrangement);
  });

  it('should throw error if invalid arrangementId is passed', () => {
    const defaultArrangement = newSongArrangement({ isDefault: true });
    const otherArrangement = newSongArrangement({ isDefault: false });
    let song = newSong({
      arrangements: [otherArrangement, defaultArrangement],
    });
    song.currentArrangementId = 123;
    expect(() => setArrangement(song)).toThrow('Invalid arrangementId: 123');
  });

  it('should return the default arrangement even if it is not the first one', () => {
    const defaultArrangement = newSongArrangement({ isDefault: true });
    const otherArrangement = newSongArrangement({ isDefault: false });
    const song = newSong({
      arrangements: [otherArrangement, defaultArrangement],
    });
    expect(getDefaultArrangement(song)).toBe(defaultArrangement);
  });

  it('removes the arrangement and sets the next one as default if the removed one was default', () => {
    const deletedArrangement = newSongArrangement({ isDefault: false, isDeleted: true });
    const defaultArrangement = newSongArrangement({ isDefault: true });
    const otherArrangement = newSongArrangement({ isDefault: false });
    const song = newSong({
      arrangements: [defaultArrangement, deletedArrangement, otherArrangement],
    });
    removeArrangement(song, 0);
    expect(song.arrangements[0].isDeleted).toBe(true);
    expect(song.arrangements[1].isDeleted).toBe(true);
    expect(song.arrangements[2].isDeleted).toBe(false);

    expect(song.arrangements[0].isDefault).toBe(false);
    expect(song.arrangements[1].isDefault).toBe(false);
    expect(song.arrangements[2].isDefault).toBe(true);
  });

  it('removes the arrangement and does not change the default if the removed one was not default', () => {
    const deletedArrangement = newSongArrangement({ isDefault: false, isDeleted: true });
    const defaultArrangement = newSongArrangement({ isDefault: true });
    const otherArrangement = newSongArrangement({ isDefault: false });
    const song = newSong({
      arrangements: [deletedArrangement, otherArrangement, defaultArrangement],
    });
    removeArrangement(song, 1);
    expect(song.arrangements[0].isDeleted).toBe(true);
    expect(song.arrangements[1].isDeleted).toBe(true);
    expect(song.arrangements[2].isDeleted).toBe(false);

    expect(song.arrangements[0].isDefault).toBe(false);
    expect(song.arrangements[1].isDefault).toBe(false);
    expect(song.arrangements[2].isDefault).toBe(true);
  });
});

describe('helper functions', () => {
  it('should group songs by first letter', () => {
    const songs = [
      newSong({ title: 'Test Song 1' }),
      newSong({ title: 'Another Song' }),
      newSong({ title: 'Água' }),
      newSong({ title: 'Important Song' }),
      newSong({ title: 'Test Song 2' }),
      newSong({ title: 'Ímpar' }),
      newSong({ title: 'Our Song' }),
      newSong({ title: 'Ótica' }),
      newSong({ title: 'Ônibus' }),
      newSong({ title: 'À Você' }),
    ];
    const grouped = groupSongsByFirstLetter(songs);
    expect(grouped.get('a')).toEqual([songs[1], songs[2], songs[9]]);
    expect(grouped.get('i')).toEqual([songs[3], songs[5]]);
    expect(grouped.get('o')).toEqual([songs[6], songs[7], songs[8]]);
    expect(grouped.get('t')).toEqual([songs[0], songs[4]]);
  });
});
