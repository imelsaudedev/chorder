import ServiceViewer from '@/fragments/ServiceViewer';
import { Service } from '@/models/service';
import { cache } from 'react';
import { getService } from './actions';

export const dynamic = 'force-dynamic';

export default async function ServicePage({
  params,
  searchParams,
}: {
  params: { service: string };
  searchParams: { edit?: string };
}) {
  const serviceSlug = params.service;
  const service =
    (serviceSlug &&
      serviceSlug !== 'new' &&
      (await cache((serviceSlug: string) => getService(serviceSlug))(serviceSlug))) ||
    new Service({ isNew: true });
  const writeMode = searchParams.edit === 'true' || serviceSlug === 'new';

  return <ServiceViewer service={service.serialize()} initialWriteMode={writeMode} />;
}
