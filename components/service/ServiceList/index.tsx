import { ClientService } from "@/prisma/models";
import { useTranslations } from "next-intl";
import ServiceListEntry from "../ServiceListEntry";
import { usePastAndFutureServices, useServicesByMonth } from "./hooks";

type ServiceListProps = {
  services: ClientService[];
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
              <ServiceListEntry key={service.slug} service={service} />
            ))}
          </ul>
        </section>
      )}

      {Object.keys(pastServicesByMonth).length > 0 && (
        <section className="px-0 sm:px-6 lg:px-8">
          {Object.entries(
            pastServicesByMonth as Record<string, ClientService[]>
          ).map(([month, services]) => (
            <div key={month} className="mb-8">
              <span className="font-bricolage text-base sm:text-lg text-zinc-400">
                {month}
              </span>
              <ul>
                {services.map((service) => (
                  <ServiceListEntry key={service.slug} service={service} />
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
