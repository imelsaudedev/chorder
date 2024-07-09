import { RequiredArrangement, Song, SongWith, WithoutArrangements } from '@/models/song';
import SongList from '../SongList';
import { useCallback } from 'react';

type SongPickerProps = {
  songs: SongWith<RequiredArrangement>[];
  onSelected: (song: SongWith<RequiredArrangement>) => void;
};

export default function SongPicker({ songs, onSelected }: SongPickerProps) {
  const handleSelected = useCallback(
    (song: WithoutArrangements<Song>) => {
      onSelected(song as SongWith<RequiredArrangement>);
    },
    [onSelected]
  );
  return (
    <div>
      <SongList songs={songs} initialsStyle="row" onSelected={handleSelected} />
    </div>
  );
}
