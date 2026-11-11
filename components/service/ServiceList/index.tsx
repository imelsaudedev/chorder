"use client";

import Section from "@/components/common/Section";
import ServiceRow, { SERVICE_ROW_GAP, SERVICE_ROW_GRID, SERVICE_ROW_PAD } from "@/components/service/ServiceRow";
import { cn } from "@/lib/utils";
import { daysUntil, groupByMonth, splitUpcomingAndPast } from "@/lib/service-list";
import { ServiceListItem } from "@/prisma/models";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";

// Cartão da lista: o mesmo da lista de músicas (borda, canto, sombra; no celular vai de ponta a ponta).
const CARD = "overflow-clip rounded-xl border shadow-xs max-sm:-mx-page max-sm:rounded-none max-sm:border-x-0";

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
          <ul className={cn(CARD, "divide-y divide-secondary/15 border-secondary/30 bg-secondary/5")}>
            {upcoming.map((service, index) => (
              <ServiceRow key={service.slug} service={service} badge={index === 0 ? nextBadge(service) : undefined} />
            ))}
          </ul>
        </Section>
      )}

      {months.length > 0 && (
        <Section title={t("history")} className={upcoming.length === 0 ? "mt-0" : undefined}>
          <div className={cn(CARD, "bg-background")}>
            <div className="divide-y divide-border">
              {/* cabeçalho de colunas, como na lista de músicas: no estreito mostra o total */}
              <div
                className={cn(
                  "grid items-center bg-zinc-50 py-3 text-sm font-medium text-muted-foreground",
                  SERVICE_ROW_PAD,
                  SERVICE_ROW_GAP,
                  SERVICE_ROW_GRID
                )}
              >
                <span className="@[720px]:hidden">{t("totalServices", { count: past.length })}</span>
                <span className="hidden @[720px]:block">{t("colDate")}</span>
                <span className="hidden @[720px]:block">{t("colService")}</span>
                <span className="hidden @[720px]:block">{t("colPreacherTheme")}</span>
                <span className="hidden @[720px]:block">{t("colSongs")}</span>
                <span className="hidden @[720px]:block" aria-hidden />
              </div>
              {months.map((month) => (
                <section key={month.key} className="divide-y divide-border">
                  {/* faixa do mês, no estilo da faixa de letra de Músicas */}
                  <h3
                    className={cn(
                      "flex h-8 items-center bg-zinc-50 text-sm font-semibold uppercase text-secondary",
                      SERVICE_ROW_PAD
                    )}
                  >
                    {month.date.toLocaleDateString(locale, { month: "long", year: "numeric" })}
                  </h3>
                  {month.items.map((service) => (
                    <ServiceRow key={service.slug} service={service} />
                  ))}
                </section>
              ))}
            </div>
          </div>
        </Section>
      )}
    </div>
  );
}
