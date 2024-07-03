import AnchorButton from '@/components/AnchorButton';
import Main from '@/components/Main';
import PlusIcon from '@/components/icons/PlusIcon';
import { retrieveServices } from '@/database/service';
import PageHeader from '@/fragments/PageHeader';
import ServiceList from '@/fragments/ServiceList';
import { cache } from 'react';

export default async function ServiceListPage() {
  const services = await cache(() => retrieveServices({}))();

  return (
    <>
      <PageHeader currentPage="services" />
      <Main className="pt-4">
        <ServiceList services={services} />
        <AnchorButton
          additionalClasses={[
            'bg-purple-400',
            'text-white',
            'rounded-full',
            'aspect-square',
            'fixed',
            'bottom-4',
            'right-4',
            'border-none',
          ]}
          href="./services/new"
        >
          <PlusIcon />
        </AnchorButton>
      </Main>
    </>
  );
}
