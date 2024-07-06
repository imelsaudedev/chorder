import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import schema, { ServiceFormSchema } from './schema';
import { Service } from '@/models/service';
import { ServiceSongUnit } from '@/models/service-unit';

export function useServiceForm(service: Service) {
  return useForm<ServiceFormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: service.title,
      worshipLeader: service.worshipLeader || '',
      date: service.date,
      units: service.units.map((unit) => {
        if (unit.type === 'SONG') {
          const song = (unit as ServiceSongUnit).song;
          return {
            type: 'SONG',
            song: {
              currentArrangementId: song.currentArrangementId,
              arrangement: {
                songMap: song.arrangement.songMap.map((internalId) => ({ internalId })),
                semitoneTranspose: song.arrangement.semitoneTranspose,
              },
            },
          };
        }
      }),
    },
  });
}
