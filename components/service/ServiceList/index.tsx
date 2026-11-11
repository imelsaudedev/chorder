"use client";

import Section from "@/components/common/Section";
import ServiceRow, { SERVICE_ROW_GRID } from "@/components/service/ServiceRow";
import { cn } from "@/lib/utils";
import { daysUntil, groupByMonth, splitUpcomingAndPast } from "@/lib/service-list";
import { ServiceListItem } from "@/prisma/models";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";

type ServiceListProps = {
  services: ServiceListItem[];
};

/** Lista de liturgias: próximas em destaque e histórico agrupado por mês. */
export default function ServiceList({ services }: ServiceListProps) {
  const t = useTranslations("Service");
  const locale = useLocale();
  const { upcoming, past } = useMemo(() => splitUpcomingAndPast(services), [services]);
  const months = useMemo(() => groupByMonth(past), [past]);

  function nextBadge(service: ServiceListItem) {
    const days = daysUntil(service.date);
    if (days <= 0) return t("relToday");
    if (days === 1) return t("relTomorrow");
    if (days < 7) return t("relThisWeek");
    if (days < 14) return t("relNextWeek");
    return t("relInWeeks", { count: Math.floor(days / 7) });
  }

  return (
    <div className="@container">
      {upcoming.length > 0 && (
        <Section title={t("nextServices")} className="mt-0">
          <ul className="divide-y divide-secondary/15 overflow-hidden rounded-xl border border-secondary/30 bg-secondary/5">
            {upcoming.map((service, index) => (
              <ServiceRow key={service.slug} service={service} badge={index === 0 ? nextBadge(service) : undefined} />
            ))}
          </ul>
        </Section>
      )}

      {months.length > 0 && (
        <Section title={t("history")} className={upcoming.length === 0 ? "mt-0" : undefined}>
          <div className="overflow-hidden rounded-xl border">
            <div
              aria-hidden
              className={cn(
                "hidden gap-x-5 border-b bg-muted/[.22] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground @[720px]:grid",
                SERVICE_ROW_GRID
              )}
            >
              <span>{t("colDate")}</span>
              <span>{t("colService")}</span>
              <span>{t("colPreacherTheme")}</span>
              <span>{t("colSongs")}</span>
              <span />
            </div>
            {months.map((month) => (
              <div key={month.key}>
                <h3 className="flex items-center border-t bg-muted/[.22] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground first:border-t-0">
                  {month.date.toLocaleDateString(locale, { month: "long", year: "numeric" })}
                  <span className="ml-auto font-medium normal-case tracking-normal">{month.items.length}</span>
                </h3>
                <ul className="divide-y">
                  {month.items.map((service) => (
                    <ServiceRow key={service.slug} service={service} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
