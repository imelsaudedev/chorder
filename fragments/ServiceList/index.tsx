'use client';

import { Switch } from '@/components/ui/switch';
import { getHumanReadableTitle, Service } from '@/models/service';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

type ServiceListProps = {
  services: Service[];
};

export default function ServiceList({ services: baseServices }: ServiceListProps) {
  const t = useTranslations();

  const [showOnlyFuture, setShowOnlyFuture] = useState(true);

  const services = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const services = baseServices.filter((service) => !showOnlyFuture || service.date.getTime() >= today.getTime());
    services.sort((a, b) => b.date.getTime() - a.date.getTime());
    return services;
  }, [baseServices, showOnlyFuture]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Switch checked={showOnlyFuture} onCheckedChange={setShowOnlyFuture} />
        <label>{t('ServiceForm.onlyFuture')}</label>
      </div>
      <section>
        {services.map((service) => (
          <div key={`${service.slug!}--section`}>
            <a href={`/services/${service.slug}`} className="flex flex-col pt-2 pb-3 border-b-gray-300 border-b-2">
              <div className="text-lg leading-none">
                {getHumanReadableTitle(service, t('Messages.service'))}
                {service.worshipLeader && ` (${service.worshipLeader})`}
              </div>
            </a>
          </div>
        ))}
      </section>
    </div>
  );
}
