import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { fetchSong, fetchSongs } from '@/lib/apiClient';
import { RequiredArrangement, Song, SongWith, WithoutArrangements } from '@/models/song';
import { useCallback, useEffect, useState } from 'react';
import SongPicker from '../../fragments/SongPicker';
import { ServiceFormFields } from './useServiceFormFields';
import { useTranslations } from 'next-intl';
import ArrangementPicker from '@/fragments/ArrangementPicker';

type AddUnitFormProps = {
  serviceFormFields: ServiceFormFields;
};

export default function AddUnitForm({ serviceFormFields }: AddUnitFormProps) {
  const t = useTranslations('ServiceForm');
  const { onCreateUnit } = serviceFormFields;
  const [song, setSong] = useState<SongWith<RequiredArrangement> | null>(null);
  const [selectedArrangementId, setSelectedArrangementId] = useState<number | null>(null);

  const [songs, setSongs] = useState<WithoutArrangements<Song>[]>([]);
  useEffect(() => {
    fetchSongs({ excludeArrangements: true }).then(setSongs).catch(console.error);
  }, []);

  const [songPopoverOpen, setSongPopoverOpen] = useState<boolean>(false);
  const onSelected = (song: WithoutArrangements<Song>) => {
    fetchSong(song.slug, { selectArrangement: true })
      .then((song: SongWith<RequiredArrangement> | null) => {
        setSong(song);
        setSelectedArrangementId(song?.currentArrangementId ?? null);
      })
      .catch(console.error);
  };
  const handleAddSongUnit = useCallback(() => {
    const arrangement = song!.arrangements[selectedArrangementId!];
    onCreateUnit({
      type: 'SONG',
      slug: song!.slug!,
      title: song!.title,
      artist: song!.artist || '',
      currentArrangementId: selectedArrangementId!,
      baseKey: arrangement.key || 'C',
      semitoneTranspose: arrangement.semitoneTranspose || 0,
      lastUnitId: arrangement.lastUnitId,
      songMap: arrangement.songMap.map((internalId) => ({
        internalId,
      })),
      units: arrangement.units,
    });
    setSongPopoverOpen(false);
  }, [onCreateUnit, selectedArrangementId, song]);
  const handlePopoverOpen = useCallback((open: boolean) => {
    setSongPopoverOpen(open);
    setSong(null);
    setSelectedArrangementId(null);
  }, []);

  return (
    <div className={`rounded-lg break-inside-avoid px-2 py-2 mb-2 border border-primary`}>
      <div className="group flex items-center gap-2 w-full cursor-pointer">
        <Drawer open={songPopoverOpen} onOpenChange={handlePopoverOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline">{t('newSongUnit')}</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="flex justify-between items-center">
                <span>{song ? t('pickArrangement') : t('pickSong')}</span>
                <Button onClick={handleAddSongUnit}>{t('add')}</Button>
              </DrawerTitle>
            </DrawerHeader>
            <div className="max-h-[80vh] overflow-auto p-4">
              {song ? (
                <ArrangementPicker
                  song={song}
                  defaultArrangementId={selectedArrangementId || 0}
                  setSelectedArrangementId={setSelectedArrangementId}
                />
              ) : (
                <SongPicker songs={songs} onSelected={onSelected} />
              )}
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}
