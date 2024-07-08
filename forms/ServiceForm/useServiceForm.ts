import { NewService } from '@/models/service';
import { ServiceSongUnit } from '@/models/service-unit';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import schema, { ServiceFormSchema, TextUnitSchema } from './schema';

export function useServiceForm(service: NewService) {
  return useForm<ServiceFormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      slug: service.slug,
      title: service.title || '',
      worshipLeader: service.worshipLeader || '',
      date: service.date,
      units: service.units.map((unit) => {
        if (unit.type === 'SONG') {
          const song = (unit as ServiceSongUnit).song;
          return {
            type: 'SONG',
            slug: song.slug,
            title: song.title,
            artist: song.artist || '',
            currentArrangementId: song.currentArrangementId,
            baseKey: song.arrangement.key || 'C',
            semitoneTranspose: song.arrangement.semitoneTranspose,
            lastUnitId: song.arrangement.lastUnitId,
            songMap: song.arrangement.songMap.map((internalId) => ({ internalId })),
            units: song.arrangement.units,
          };
        } else if (unit.type === 'TEXT') {
          return { type: 'TEXT', content: (unit as TextUnitSchema).content };
        }
        throw new Error('Invalid unit type');
      }),
    },
  });
}
