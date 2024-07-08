import { RequiredArrangement, SongWith } from '@/models/song';
import SongList from '../SongList';

type SongPickerProps = {
  songs: SongWith<RequiredArrangement>[];
  onSelected: (song: SongWith<RequiredArrangement>, arrangementId: number) => void;
};

export default function SongPicker({ songs, onSelected }: SongPickerProps) {
  return (
    <div>
      <SongList songs={songs} initialsStyle="row" onSelected={onSelected} />
    </div>
  );
}
