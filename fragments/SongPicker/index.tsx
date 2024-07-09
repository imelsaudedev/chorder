import { Song, WithoutArrangements } from '@/models/song';
import { useCallback } from 'react';
import SongList from '../SongList';

type SongPickerProps = {
  songs: WithoutArrangements<Song>[];
  onSelected: (song: WithoutArrangements<Song>) => void;
};

export default function SongPicker({ songs, onSelected }: SongPickerProps) {
  const handleSelected = useCallback(
    (song: WithoutArrangements<Song>) => {
      onSelected(song);
    },
    [onSelected]
  );
  return (
    <div>
      <SongList songs={songs} initialsStyle="row" onSelected={handleSelected} />
    </div>
  );
}
