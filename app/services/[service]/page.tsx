import ServiceViewer from '@/fragments/ServiceViewer';
import { getServiceOrCreate } from './actions';
import Header from '@/components/Header';

export const dynamic = 'force-dynamic';

export default async function ServicePage({
  params,
  searchParams,
}: {
  params: { service: string };
  searchParams: { edit?: string };
}) {
  const serviceSlug = params.service;
  const service = await getServiceOrCreate(serviceSlug);
  const writeMode = searchParams.edit === 'true' || serviceSlug === 'new';

  return (
    <>
      <Header currentPage="services" />
      <ServiceViewer service={service} initialWriteMode={writeMode} />
    </>
  );
}
