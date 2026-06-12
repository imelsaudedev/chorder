import Text from "@/components/common/Text";
import { ClientService } from "@/prisma/models";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";

type ServiceListEntryProps = {
  service: ClientService;
  variant?: "default" | "card";
};

export default function ServiceListEntry({ service, variant = "default" }: ServiceListEntryProps) {
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

  const linkClass =
    variant === "card"
      ? "flex flex-col py-2.5 px-2 -mx-2 rounded-md hover:bg-secondary/10 transition-colors"
      : "flex flex-col py-2.5 px-2 -mx-2 rounded-md hover:bg-zinc-50 transition-colors";

  return (
    <li>
      <a href={`/services/${service.slug}`} className={linkClass}>
        <p className="font-display font-semibold text-base lg:text-lg tracking-tight leading-snug lg:leading-tight text-primary truncate">
          {serviceTitle}
        </p>
        <div className="flex items-center gap-1 mt-0.5">
          <Text variant="caption" as="span" className="text-xs md:text-sm">
            {serviceDate}
          </Text>
          {service.worshipLeader && (
            <>
              <Text variant="caption" as="span" className="text-xs md:text-sm">·</Text>
              <Text variant="caption" as="span" className="text-xs md:text-sm">
                {service.worshipLeader}
              </Text>
            </>
          )}
        </div>
      </a>
    </li>
  );
}
