'use server';

import { retrieveService, saveService } from '@/database/service';
import { ServiceFormSchema, SongUnitSchema } from '@/forms/ServiceForm/schema';
import { NewService, OptionalSlug, RequiredIsNew, Service, ServiceWith } from '@/models/service';
import { ServiceSongUnit, ServiceUnit } from '@/models/service-unit';
import { RequiredArrangement, SongWith } from '@/models/song';
import { SongArrangement } from '@/models/song-arrangement';
import { redirect, RedirectType } from 'next/navigation';

export type PostServiceAction = ((service: ServiceFormSchema) => Promise<void>) & Function;

export const postService: PostServiceAction = async function (serviceData: ServiceFormSchema) {
  const service: NewService = {
    title: serviceData.title,
    slug: serviceData.slug,
    worshipLeader: serviceData.worshipLeader,
    date: serviceData.date,
    isDeleted: false,
    units: serviceData.units.map((unit) => {
      if (unit.type === 'SONG') {
        const baseUnit = unit as SongUnitSchema;

        const arrangement: SongArrangement = {
          key: baseUnit.baseKey,
          units: baseUnit.units,
          songMap: baseUnit.songMap.map(({ internalId }) => internalId),
          // Not sure about these ones, but I think we ignore them when saving the unit song
          isDefault: true,
          isDeleted: false,
          lastUnitId: baseUnit.lastUnitId,
          semitoneTranspose: baseUnit.semitoneTranspose,
        };
        const song: SongWith<RequiredArrangement> = {
          slug: baseUnit.slug,
          title: baseUnit.title,
          artist: baseUnit.artist || null,
          // Not sure about these ones, but I think we ignore them when saving the unit song
          isDeleted: false,
          lyrics: '',
          arrangements: [arrangement],
          currentArrangementId: baseUnit.currentArrangementId,
          arrangement,
        };
        const newUnit: ServiceSongUnit = {
          type: 'SONG',
          arrangementId: baseUnit.currentArrangementId,
          song,
        };
        return newUnit;
      } else {
        throw new Error(`Unsupported unit type: ${unit.type}`);
      }
    }),
  };
  const savedService = await saveService(service);
  redirect(`./${savedService.slug}`, RedirectType.replace);
};

export type DeleteServiceAction = ((service: Service) => void) & Function;

export const deleteService: DeleteServiceAction = async function (service) {
  service.isDeleted = true;
  await saveService(service);
  redirect(`./`, RedirectType.replace);
};

export async function getServiceOrCreate(slug: string | undefined): Promise<ServiceWith<OptionalSlug & RequiredIsNew>> {
  const service = (slug && slug !== 'new' && (await retrieveService(slug))) || null;
  let isNew = !service;
  const units = service?.units || ([] as ServiceUnit[]);
  return {
    title: service?.title,
    slug: slug === 'new' ? undefined : slug,
    worshipLeader: service?.worshipLeader || null,
    date: service?.date || new Date(),
    isDeleted: !!service?.isDeleted,
    units,
    isNew,
  };
}
