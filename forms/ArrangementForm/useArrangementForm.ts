import { Song } from '@/models/song';
import { SongArrangement } from '@/models/song-arrangement';
import schema, { ArrangementFormSchema } from './schema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export function useArrangementForm(song: Song, arrangement: SongArrangement) {
  return useForm<ArrangementFormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: song.title,
      artist: song.artist || '',
      key: arrangement.key,
      songMap: arrangement.songMap.map((internalId) => ({ internalId })),
    },
  });
}
