import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import messages from '@/i18n/messages';
import { fetchSong, fetchSongs } from '@/lib/apiClient';
import { RequiredArrangement, Song, SongWith, WithoutArrangements } from '@/models/song';
import { useEffect, useState } from 'react';
import SongPicker from '../../fragments/SongPicker';
import { ServiceFormFields } from './useServiceFormFields';

type AddUnitFormProps = {
  serviceFormFields: ServiceFormFields;
};

export default function AddUnitForm({ serviceFormFields }: AddUnitFormProps) {
  const { onCreateUnit } = serviceFormFields;

  const [songs, setSongs] = useState<WithoutArrangements<Song>[]>([]);
  useEffect(() => {
    fetchSongs({ excludeArrangements: true }).then(setSongs).catch(console.error);
  }, []);

  const [songPopoverOpen, setSongPopoverOpen] = useState<boolean>(false);
  const onSelected = (song: WithoutArrangements<Song>) => {
    fetchSong(song.slug, { selectArrangement: true })
      .then((song: SongWith<RequiredArrangement>) => {
        onCreateUnit({
          type: 'SONG',
          slug: song.slug!,
          title: song.title,
          artist: song.artist || '',
          currentArrangementId: song.currentArrangementId,
          baseKey: song.arrangement?.key || 'C',
          semitoneTranspose: song.arrangement?.semitoneTranspose || 0,
          lastUnitId: song.arrangement.lastUnitId,
          songMap: song.arrangement.songMap.map((internalId) => ({
            internalId,
          })),
          units: song.arrangement.units,
        });
        setSongPopoverOpen(false);
      })
      .catch(console.error);
  };

  return (
    <div className={`rounded-lg break-inside-avoid px-2 py-2 mb-2 border border-primary`}>
      <div className="group flex items-center gap-2 w-full cursor-pointer">
        <Drawer open={songPopoverOpen} onOpenChange={setSongPopoverOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline">{messages.serviceForm.newSongUnit}</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{messages.serviceForm.pickSong}</DrawerTitle>
            </DrawerHeader>
            <div className="max-h-[80vh] overflow-auto p-4">
              <SongPicker songs={songs} onSelected={onSelected} />
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}
