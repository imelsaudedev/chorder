import Heading from "@/components/common/Heading";
import { ClientService } from "@/prisma/models";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";

type ServiceListEntryProps = {
  service: ClientService;
};
export default function ServiceListEntry({ service }: ServiceListEntryProps) {
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
