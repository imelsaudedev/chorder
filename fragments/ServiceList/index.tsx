'use client';

import { Calendar, MicVocal } from 'lucide-react';
import { getHumanReadableTitle, Service } from '@/models/service';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

type ServiceListProps = {
  services: Service[];
};

export default function ServiceList({ services: baseServices }: ServiceListProps) {
  const t = useTranslations();
  const [showOnlyFuture, setShowOnlyFuture] = useState(false);

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
        <section className="bg-slate-100 p-4 rounded-xl">
          <h2 className="text-2xl font-semibold text-secondary pb-1">Próximas liturgias</h2>
          <ul>
            {futureServices.map((service) => (
              <ServiceItem key={service.slug} service={service} />
            ))}
          </ul>
        </section>
      )}

      {Object.keys(pastServicesByMonth).length > 0 && (
        <section className="border-1">
          <h2 className="text-2xl font-semibold pt-8">Liturgias anteriores</h2>
          {Object.entries(pastServicesByMonth as Record<string, Service[]>).map(([month, services]) => (
            <div key={month} className="mt-8">
              <h3 className="text-lg font-medium text-slate-400 border-b pb-1">{month}</h3>
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
    <li className="pt-3">
      <a href={`/services/${service.slug}`} className="block hover:bg-gray-100 transition">
        <div className="text-lg font-semibold text-black">{getHumanReadableTitle(service, 'Liturgia')}</div>
        <div className="text-sm flex flex-col sm:flex-row sm:justify-start sm:items-center text-slate-400 gap-2 mt-1">
          <div className="flex items-center gap-1">
            <Calendar size={16} />
            {new Date(String(service.date))
              .toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
              .replace(/^\w/, (c) => c.toUpperCase())}
          </div>
          {service.worshipLeader && (
            <div className="flex items-center gap-1">
              <MicVocal size={16} />
              {service.worshipLeader}
            </div>
          )}
        </div>
      </a>
    </li>
  );
}
