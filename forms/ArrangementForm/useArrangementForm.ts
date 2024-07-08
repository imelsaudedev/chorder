import { NewSong } from '@/models/song';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import schema, { ArrangementFormSchema } from './schema';

export function useArrangementForm(song: NewSong) {
  return useForm<ArrangementFormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: song.title,
      artist: song.artist || '',
      key: song.arrangement.key,
      lastUnitId: song.arrangement.lastUnitId,
      songMap: song.arrangement.songMap.map((internalId) => ({ internalId })),
      units: song.arrangement.units,
    },
  });
}
