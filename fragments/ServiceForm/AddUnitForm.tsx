import { MouseEventHandler, useEffect, useState } from 'react';
import messages, { format } from '@/i18n/messages';
import { ServiceUnit } from '@/models/service';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import SongPicker from '../SongPicker';
import { Song } from '@/models/song';
import { fetchSongs } from '@/lib/apiClient';
import { setOriginalNode } from 'typescript';

type AddUnitFormProps = {
  onCreateUnit: () => void;
};

export default function AddUnitForm({ onCreateUnit }: AddUnitFormProps) {
  const [songs, setSongs] = useState<Song[]>([]);
  useEffect(() => {
    fetchSongs().then(setSongs).catch(console.error);
  }, []);

  const handleAddNewUnit: MouseEventHandler = (event) => {
    event.preventDefault();
    onCreateUnit();
  };

  const [songPopoverOpen, setSongPopoverOpen] = useState<boolean>(false);
  const onSelected = (song: Song) => {
    console.log(song);
    setSongPopoverOpen(false);
  };

  return (
    <div className={`border rounded-lg break-inside-avoid px-2 py-2 mb-2 bg-purple-100 border-purple-400`}>
      <div className="group flex items-center gap-2 w-full cursor-pointer">
        <Popover open={songPopoverOpen} onOpenChange={setSongPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline">{messages.serviceData.newSongUnit}</Button>
          </PopoverTrigger>
          <PopoverContent className="w-full max-h-[80vh] overflow-auto">
            <SongPicker songs={songs} onSelected={onSelected} />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
