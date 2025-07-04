import { ClientService } from "@/prisma/models";
import { useLocale } from "next-intl";
import { useMemo } from "react";

export function usePastAndFutureServices(
  allServices: ClientService[]
): [ClientService[], ClientService[]] {
  return useMemo(() => {
    const today = getCurrentDate();

    const past: ClientService[] = [];
    const future: ClientService[] = [];

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

export function useServicesByMonth(
  services: ClientService[]
): Record<string, ClientService[]> {
  const locale = useLocale();

  return useMemo(() => {
    const servicesByMonth: Record<string, ClientService[]> = {};

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

    const sortedServicesByMonth: [string, ClientService[]][] = Object.entries(
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
