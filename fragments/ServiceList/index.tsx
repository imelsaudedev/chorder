'use client';

import Heading from '@/components/Heading';
import { getHumanReadableTitle, Service } from '@/models/service';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

type ServiceListProps = {
  services: Service[];
};

export default function ServiceList({ services: baseServices }: ServiceListProps) {
  const t = useTranslations();

  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);

  const { futureServices, pastServicesByMonth } = useMemo(() => {
    const future: Service[] = [];
    const past: Record<string, Service[]> = {};

    baseServices.forEach((service) => {
      const serviceDate = service.date instanceof Date ? service.date : new Date(String(service.date));
      const isFuture = serviceDate.getTime() >= today.getTime();

      if (isFuture) {
        future.push(service);
      } else {
        const monthKey = serviceDate
          .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
          .replace(/^\w/, (c) => c.toUpperCase());

        if (!past[monthKey]) past[monthKey] = [];
        past[monthKey].push(service);
      }
    });

    future.sort((a, b) => a.date.getTime() - b.date.getTime());

    const sortedPastServices: [string, Service[]][] = Object.entries(past)
      .sort(([monthA], [monthB]) => new Date(monthB).getTime() - new Date(monthA).getTime())
      .map(([month, services]) => [month, services.sort((a, b) => b.date.getTime() - a.date.getTime())]);

    return {
      futureServices: future,
      pastServicesByMonth: Object.fromEntries(sortedPastServices),
    };
  }, [baseServices, today]);

  return (
    <div className="space-y-6">
      {futureServices.length > 0 && (
        <section className="bg-zinc-50 p-4 sm:p-6 lg:p-8 mb-4 sm:mb-8 rounded-lg border border-zinc-100">
          <span className="font-bricolage text-base sm:text-lg text-secondary">Próximas liturgias</span>
          <ul>
            {futureServices.map((service) => (
              <ServiceItem key={service.slug} service={service} />
            ))}
          </ul>
        </section>
      )}

      {Object.keys(pastServicesByMonth).length > 0 && (
        <section className="px-0 sm:px-6 lg:px-8">
          {Object.entries(pastServicesByMonth as Record<string, Service[]>).map(([month, services]) => (
            <div key={month} className="mb-8">
              <span className="font-bricolage text-base sm:text-lg text-zinc-400">{month}</span>
              <ul>
                {services.map((service) => (
                  <ServiceItem key={service.slug} service={service} />
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

function ServiceItem({ service }: { service: Service }) {
  return (
    <li className="pt-2">
      <a href={`/services/${service.slug}`} className="block">
        <Heading level={3}>{getHumanReadableTitle(service, 'Liturgia')}</Heading>
        <div className="text-sm flex flex-row sm:justify-start sm:items-center text-zinc-600 gap-1">
          <div className="flex items-center gap-1">
            {new Date(String(service.date))
              .toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'numeric' })
              .replace(/^\w/, (c) => c.toUpperCase())}
          </div>
          {service.worshipLeader && (
            <>
              <span>·</span>
              <div>{service.worshipLeader}</div>
            </>
          )}
        </div>
      </a>
    </li>
  );
}
