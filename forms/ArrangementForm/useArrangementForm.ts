import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import schema, { ArrangementFormSchema } from './schema';
import { RequiredArrangement, SongWith } from '@/models/song';

export function useArrangementForm(song: SongWith<RequiredArrangement>) {
  return useForm<ArrangementFormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: song.title,
      artist: song.artist || '',
      key: song.arrangement.key,
      songMap: song.arrangement.songMap.map((internalId) => ({ internalId })),
    },
  });
}
