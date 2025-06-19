import { Service } from "@/generated/prisma";
import Heading from "@components/Heading";
import { useTranslations, useLocale } from "next-intl";
import { useMemo } from "react";

type ServiceListProps = {
  services: Service[];
};

export default function ServiceList({
  services: allServices,
}: ServiceListProps) {
  const t = useTranslations();
  const [pastServices, futureServices] = usePastAndFutureServices(allServices);
  const pastServicesByMonth = useServicesByMonth(pastServices);

  return (
    <div className="space-y-6">
      {futureServices.length > 0 && (
        <section className="bg-zinc-50 p-4 sm:p-6 lg:p-8 mb-4 sm:mb-8 rounded-lg border border-zinc-100">
          <span className="font-bricolage text-base sm:text-lg text-secondary">
            {t("Service.nextService")}
          </span>
          <ul>
            {futureServices.map((service) => (
              <ServiceItem key={service.slug} service={service} />
            ))}
          </ul>
        </section>
      )}

      {Object.keys(pastServicesByMonth).length > 0 && (
        <section className="px-0 sm:px-6 lg:px-8">
          {Object.entries(pastServicesByMonth as Record<string, Service[]>).map(
            ([month, services]) => (
              <div key={month} className="mb-8">
                <span className="font-bricolage text-base sm:text-lg text-zinc-400">
                  {month}
                </span>
                <ul>
                  {services.map((service) => (
                    <ServiceItem key={service.slug} service={service} />
                  ))}
                </ul>
              </div>
            )
          )}
        </section>
      )}
    </div>
  );
}

function ServiceItem({ service }: { service: Service }) {
  const t = useTranslations();
  const locale = useLocale();

  const serviceTitle = useMemo(
    () => service.title?.trim() || t("Service.noTitle"),
    [service.title, t]
  );
  const serviceDate = useMemo(
    () =>
      new Date(String(service.date))
        .toLocaleDateString(locale, {
          weekday: "long",
          day: "numeric",
          month: "numeric",
        })
        .replace(/^\w/, (c) => c.toUpperCase()),
    [locale, service.date]
  );

  return (
    <li className="pt-2">
      <a href={`/services/${service.slug}`} className="block">
        <Heading level={3}>{serviceTitle}</Heading>
        <div className="text-sm flex flex-row sm:justify-start sm:items-center text-zinc-600 gap-1">
          <div className="flex items-center gap-1">{serviceDate}</div>
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

function usePastAndFutureServices(
  allServices: Service[]
): [Service[], Service[]] {
  return useMemo(() => {
    const today = getCurrentDate();

    const past: Service[] = [];
    const future: Service[] = [];

    allServices.forEach((service) => {
      const serviceDate =
        service.date instanceof Date
          ? service.date
          : new Date(String(service.date));
      const isFuture = serviceDate.getTime() >= today.getTime();

      if (isFuture) {
        future.push(service);
      } else {
        past.push(service);
      }
    });

    past.sort((a, b) => a.date.getTime() - b.date.getTime());
    future.sort((a, b) => a.date.getTime() - b.date.getTime());

    return [past, future];
  }, [allServices]);
}

function useServicesByMonth(services: Service[]): Record<string, Service[]> {
  const locale = useLocale();

  return useMemo(() => {
    const servicesByMonth: Record<string, Service[]> = {};

    services.forEach((service) => {
      const serviceDate =
        service.date instanceof Date
          ? service.date
          : new Date(String(service.date));
      const monthKey = serviceDate
        .toLocaleDateString(locale, { month: "long", year: "numeric" })
        .replace(/^\w/, (c) => c.toUpperCase());

      if (!servicesByMonth[monthKey]) {
        servicesByMonth[monthKey] = [];
      }
      servicesByMonth[monthKey].push(service);
    });

    const sortedServicesByMonth: [string, Service[]][] = Object.entries(
      servicesByMonth
    )
      .sort(
        ([monthA], [monthB]) =>
          new Date(monthB).getTime() - new Date(monthA).getTime()
      )
      .map(([month, services]) => [
        month,
        services.sort((a, b) => b.date.getTime() - a.date.getTime()),
      ]);

    return Object.fromEntries(sortedServicesByMonth);
  }, [locale, services]);
}

function getCurrentDate() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}
