import Header from '@/components/Header';
import Main from '@/components/Main';
import { Plus, ListMusic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cachedRetrieveServices } from '@/database/service';
import ServiceList from '@/fragments/ServiceList';
import Link from 'next/link';
import ScrollToTopButton from '@/components/ScrollToTopButton';

export const dynamic = 'force-dynamic';

export default async function ServiceListPage() {
  const services = await cachedRetrieveServices({});

  return (
    <>
      <Header currentPage="services" />
      <div className="px-4 sm:px-6 lg:px-8 mb-2 sm:mb-4 ">
        {/* Container flexível para o título e o botão */}
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-3xl sm:text-4xl leading-none text-primary tracking-tighter flex items-center gap-2">
            <ListMusic className="w-10 h-10w-8 sm:w-10 h-8 sm:h-10" strokeWidth={2} />
            Liturgias
          </h1>
        </div>
      </div>
      <Main>
        <ServiceList services={services} />
      </Main>

      {/* Botão flutuante */}
      <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8">
        <Button asChild variant="secondary" size="square" rounded="full" className="shadow-lg">
          <Link href="./services/new" className="flex items-center gap-1 sm:pr-6">
            <Plus />
            <span className="hidden sm:inline">Nova liturgia</span>
          </Link>
        </Button>
      </div>

      <ScrollToTopButton />
    </>
  );
}
