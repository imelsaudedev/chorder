import ServiceViewer from '@/fragments/ServiceViewer';
import SongViewer from '@/fragments/SongViewer';
import { Service } from '@/models/service';
import { Song } from '@/models/song';
import { cache } from 'react';

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
    // (serviceSlug && serviceSlug !== 'new' && (await cache((songSlug: string) => getSong(songSlug))(serviceSlug))) ||
    // new Song({});
    new Service({});
  const writeMode = searchParams.edit === 'true' || serviceSlug === 'new';

  return <ServiceViewer service={service.serialize()} initialWriteMode={writeMode} />;
}
