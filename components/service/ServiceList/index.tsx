import Text from "@/components/common/Text";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ClientService } from "@/prisma/models";
import { DateTime } from "luxon";
import { useLocale, useTranslations } from "next-intl";
import ServiceListEntry from "../ServiceListEntry";
import { usePastAndFutureServices, useServicesByMonth } from "./hooks";

type ServiceListProps = {
  services: ClientService[];
};

export default function ServiceList({ services: allServices }: ServiceListProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [pastServices, futureServices] = usePastAndFutureServices(allServices);
  const pastServicesByMonth = useServicesByMonth(pastServices);

  return (
    <div className="space-y-6">
      {futureServices.length > 0 && (
        <Card className="border-secondary/30 bg-secondary/5 mb-4 sm:mb-8 gap-3">
          <CardHeader>
            <Text variant="overline" as="p">{t("Service.nextService")}</Text>
          </CardHeader>
          <CardContent className="pb-2">
            <ul className="divide-y divide-secondary/10">
              {futureServices.map((service) => (
                <ServiceListEntry key={service.slug} service={service} variant="card" />
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {Object.keys(pastServicesByMonth).length > 0 && (
        <section>
          {pastServicesByMonth.map(([month, services]) => (
            <div key={month} className="mb-8">
              <Text variant="overline" as="p" className="mb-2">
                {DateTime.fromISO(month)
                  .setLocale(locale)
                  .toLocaleString({ month: "long", year: "numeric" })
                  .toUpperCase()}
              </Text>
              <ul className="divide-y divide-zinc-100">
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
