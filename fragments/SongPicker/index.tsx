import { Song } from '@/models/song';
import SongList from '../SongList';

type SongPickerProps = {
  songs: Song[];
  onSelected: (song: Song, arrangementId: number) => void;
};

export default function SongPicker({ songs, onSelected }: SongPickerProps) {
  return (
    <div>
      <SongList songs={songs} initialsStyle="row" onSelected={onSelected} />
    </div>
  );
}
