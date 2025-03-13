import Header from '@/components/Header';
import Main from '@/components/Main';
import { ListMusic } from 'lucide-react';
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
            <ListMusic className="w-10 h-10" />
            Liturgias
          </h1>

          {/* Botão retangular com texto */}
          <Button variant="secondary" asChild>
            <Link href="./services/new" className="flex items-center gap-1">
              <ListMusic className="w-5 h-5" />
              <span>Nova Liturgia</span>
            </Link>
          </Button>
        </div>
      </div>
      <Main>
        <ServiceList services={services} />
      </Main>
      <ScrollToTopButton />
    </>
  );
}
