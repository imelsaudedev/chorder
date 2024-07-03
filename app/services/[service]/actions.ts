'use server';

import { retrieveService, saveService } from '@/database/service';
import { SerializedService, Service } from '@/models/service';
import { revalidatePath } from 'next/cache';
import { RedirectType, redirect } from 'next/navigation';

export type PostServiceAction = ((service: SerializedService) => Promise<void>) & Function;

export const postService: PostServiceAction = async function (serializedService: SerializedService) {
  const service = Service.deserialize(serializedService);
  const savedService = await saveService(service);
  revalidatePath('/services', 'page');
  revalidatePath(`/services/${savedService.slug}`, 'page');
  redirect(`./${savedService.slug}`, RedirectType.replace);
};

export type DeleteServiceAction = ((service: SerializedService) => void) & Function;

export const deleteService: DeleteServiceAction = async function (serializedService: SerializedService) {
  const service = Service.deserialize(serializedService);
  service.isDeleted = true;
  const savedService = await saveService(service);
  revalidatePath('/services', 'page');
  revalidatePath(`/services/${savedService.slug}`, 'page');
  redirect(`./`, RedirectType.replace);
};

export async function getService(slug: string) {
  return retrieveService(slug);
}