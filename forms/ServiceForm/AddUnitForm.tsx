import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import messages from '@/i18n/messages';
import { fetchSongs } from '@/lib/apiClient';
import { RequiredArrangement, SongWith } from '@/models/song';
import { useEffect, useState } from 'react';
import SongPicker from '../../fragments/SongPicker';
import { ServiceFormFields } from './useServiceFormFields';

type AddUnitFormProps = {
  serviceFormFields: ServiceFormFields;
};

export default function AddUnitForm({ serviceFormFields }: AddUnitFormProps) {
  const { onCreateUnit } = serviceFormFields;

  const [songs, setSongs] = useState<SongWith<RequiredArrangement>[]>([]);
  useEffect(() => {
    fetchSongs().then(setSongs).catch(console.error);
  }, []);

  const [songPopoverOpen, setSongPopoverOpen] = useState<boolean>(false);
  const onSelected = (song: SongWith<RequiredArrangement>, arrangementId: number) => {
    onCreateUnit({
      type: 'SONG',
      slug: song.slug!,
      title: song.title,
      artist: song.artist || '',
      currentArrangementId: arrangementId,
      baseKey: song.arrangement?.key || 'C',
      semitoneTranspose: song.arrangement?.semitoneTranspose || 0,
      lastUnitId: song.arrangement.lastUnitId,
      songMap: song.arrangement.songMap.map((internalId) => ({
        internalId,
      })),
      units: song.arrangement.units,
    });
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
