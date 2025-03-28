import Header from '@/components/Header';
import NavBar from '@/components/NavBar';
import Heading from '@/components/Heading';
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
    <div className="flex">
      {/* Sidebar fixa */}
      <NavBar currentPage="services" />

      {/* Conteúdo principal com deslocamento para a direita em telas grandes */}
      <div className="flex flex-col flex-grow ml-0 sm:ml-20">
        <div className="flex flex-col flex-grow justify-between gap-4 px-4 sm:px-12 lg:px-16 pt-8 sm:pt-12 lg:pt-16 pb-4 sm:pb-6 lg:pb-8">
          <Heading level={1} className="flex items-center gap-2">
            <ListMusic className="w-8 lg:w-10 h-8 lg:h-10" />
            Liturgias
          </Heading>
        </div>

        <Main>
          <ServiceList services={services} />
        </Main>

        {/* Botão flutuante */}
        <div className="fixed bottom-24 sm:bottom-8 right-4 sm:right-8">
          <Button asChild variant="secondary" size="square" rounded="full" className="shadow-md">
            <Link href="./services/new" className="flex items-center gap-1 sm:pr-6">
              <Plus />
              <span className="hidden sm:inline">Nova liturgia</span>
            </Link>
          </Button>
        </div>

        <ScrollToTopButton />
      </div>
    </div>
  );
}
