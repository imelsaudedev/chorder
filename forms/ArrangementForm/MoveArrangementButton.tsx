import { MoveArrangementAction } from '@/app/(main)/songs/[song]/actions';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import SongPicker from '@/fragments/SongPicker';
import { fetchSongs } from '@/lib/apiClient';
import { RequiredArrangement, Song, SongWith, WithoutArrangements } from '@/models/song';
import { RequiredIsNew, SongArrangementWith } from '@/models/song-arrangement';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

type MoveArrangementButtonProps = {
  song: SongWith<RequiredArrangement<SongArrangementWith<RequiredIsNew>>>;
  moveArrangement: MoveArrangementAction;
};

export default function MoveArrangementButton({ song, moveArrangement }: MoveArrangementButtonProps) {
  const t = useTranslations();
  const arrangement = song.arrangement;

  const [songs, setSongs] = useState<WithoutArrangements<Song>[]>([]);
  useEffect(() => {
    fetchSongs({ excludeArrangements: true })
      .then((songs) => setSongs(songs.filter((s: WithoutArrangements<Song>) => s.slug !== song.slug)))
      .catch(console.error);
  }, [song.slug]);

  const moveArrangementTo = (destSong: WithoutArrangements<Song>) => {
    moveArrangement(song.slug as string, song.currentArrangementId, destSong.slug);
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        {!arrangement.isNew && <Button variant="destructive">{t('SongForm.moveArrangement')}</Button>}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t('ServiceForm.pickSong')}</DrawerTitle>
        </DrawerHeader>
        <div className="max-h-[80vh] overflow-auto p-4">
          <SongPicker songs={songs} onSelected={moveArrangementTo} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
