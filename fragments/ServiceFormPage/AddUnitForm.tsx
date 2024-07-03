import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import messages from '@/i18n/messages';
import { fetchSongs } from '@/lib/apiClient';
import { Song } from '@/models/song';
import { useEffect, useState } from 'react';
import SongPicker from '../SongPicker';

type AddUnitFormProps = {
  onCreateUnit: (song: Song, arrangementId: number) => void;
};

export default function AddUnitForm({ onCreateUnit }: AddUnitFormProps) {
  const [songs, setSongs] = useState<Song[]>([]);
  useEffect(() => {
    fetchSongs().then(setSongs).catch(console.error);
  }, []);

  const [songPopoverOpen, setSongPopoverOpen] = useState<boolean>(false);
  const onSelected = (song: Song, arrangementId: number) => {
    onCreateUnit(song, arrangementId);
    setSongPopoverOpen(false);
  };

  return (
    <div className={`border rounded-lg break-inside-avoid px-2 py-2 mb-2 bg-purple-100 border-purple-400`}>
      <div className="group flex items-center gap-2 w-full cursor-pointer">
        <Popover open={songPopoverOpen} onOpenChange={setSongPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline">{messages.serviceForm.newSongUnit}</Button>
          </PopoverTrigger>
          <PopoverContent className="w-full max-h-[80vh] overflow-auto">
            <SongPicker songs={songs} onSelected={onSelected} />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
