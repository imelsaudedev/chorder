'use server';

import { retrieveService, saveService } from '@/database/service';
import { RequiredSlug, Service, ServiceWith } from '@/models/service';
import { ServiceUnit } from '@/models/service-unit';
import { RedirectType, redirect } from 'next/navigation';

export type PostServiceAction = ((service: Service) => Promise<void>) & Function;

export const postService: PostServiceAction = async function (service: Service) {
  const savedService = await saveService(service);
  redirect(`./${savedService.slug}`, RedirectType.replace);
};

export type DeleteServiceAction = ((service: ServiceWith<RequiredSlug>) => void) & Function;

export const deleteService: DeleteServiceAction = async function (service) {
  service.isDeleted = true;
  await saveService(service);
  redirect(`./`, RedirectType.replace);
};

export async function getServiceOrCreate(slug: string | undefined): Promise<Service> {
  const service = (slug && slug !== 'new' && (await retrieveService(slug))) || null;
  let isNew = !service;
  const units = service?.units || ([] as ServiceUnit[]);
  return {
    title: service?.title,
    slug,
    worshipLeader: service?.worshipLeader || null,
    date: service?.date || new Date(),
    isDeleted: !!service?.isDeleted,
    units,
    isNew,
  };
}
