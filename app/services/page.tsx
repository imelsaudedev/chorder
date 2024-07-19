import Header from '@/components/Header';
import Main from '@/components/Main';
import PlusIcon from '@/components/icons/PlusIcon';
import { Button } from '@/components/ui/button';
import { cachedRetrieveServices } from '@/database/service';
import ServiceList from '@/fragments/ServiceList';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ServiceListPage() {
  const services = await cachedRetrieveServices({});

  return (
    <>
      <Header currentPage="services" />
      <Main>
        <ServiceList services={services} />
        <Button variant="secondary" className="p-0 rounded-full aspect-square fixed bottom-4 right-4" asChild>
          <Link href="./services/new">
            <PlusIcon />
          </Link>
        </Button>
      </Main>
    </>
  );
}
