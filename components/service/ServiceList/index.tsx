"use client";

import Section from "@/components/common/Section";
import ServiceRow, {
  SERVICE_ROW_GAP,
  SERVICE_ROW_GRID,
  SERVICE_ROW_GRID_NARROW,
  SERVICE_ROW_PAD,
  TimelineRail,
  TimelineTone,
} from "@/components/service/ServiceRow";
import { cn } from "@/lib/utils";
import { daysUntil, groupByMonth, splitUpcomingAndPast } from "@/lib/service-list";
import { ServiceListItem } from "@/prisma/models";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";

type ServiceListProps = {
  services: ServiceListItem[];
};

// Cartão da lista: o mesmo da lista de músicas (borda, canto, sombra; no celular vai de ponta a ponta).
const CARD = "overflow-clip rounded-xl border shadow-xs max-sm:-mx-page max-sm:rounded-none max-sm:border-x-0";

/** Mesma grade da linha (data | trilho | conteúdo), para faixas e cabeçalho alinharem com os itens. */
const ROW_GRID = cn("grid", SERVICE_ROW_PAD, SERVICE_ROW_GAP, SERVICE_ROW_GRID_NARROW, SERVICE_ROW_GRID);

/** Faixa do mês: o trilho atravessa a faixa; o texto começa na coluna do título. */
function MonthBand({ label, tone, first }: { label: string; tone: TimelineTone; first?: boolean }) {
  return (
    <h3
      className={cn(
        ROW_GRID,
        "h-8 items-center text-sm font-semibold uppercase text-secondary",
        tone === "upcoming" ? "bg-secondary/10" : "bg-zinc-50"
      )}
    >
      <TimelineRail tone={tone} first={first} inBand />
      <span className="col-start-3 col-end-[-1] [grid-row:1]">{label}</span>
    </h3>
  );
}

/**
 * Lista de liturgias como linha do tempo, em dois blocos: as próximas (do mais próximo ao mais
 * distante, pontos azuis, sempre no alto; o próximo culto é o primeiro) e o histórico (do mais recente ao mais antigo, pontos cinza).
 */
export default function ServiceList({ services }: ServiceListProps) {
  const t = useTranslations("Service");
  const locale = useLocale();
  const { upcoming, past } = useMemo(() => splitUpcomingAndPast(services), [services]);
  const upcomingMonths = useMemo(() => groupByMonth(upcoming), [upcoming]);
  const pastMonths = useMemo(() => groupByMonth(past), [past]);

  const monthLabel = (date: Date) => date.toLocaleDateString(locale, { month: "long", year: "numeric" });

  function nextBadge(service: ServiceListItem) {
    const days = daysUntil(service.date);
    if (days <= 0) return t("relToday");
    if (days === 1) return t("relTomorrow");
    if (days < 7) return t("relThisWeek");
    if (days < 14) return t("relNextWeek");
    return t("relInWeeks", { count: Math.floor(days / 7) });
  }

  const lastUpcoming = upcoming[upcoming.length - 1];
  const firstPast = past[0];
  const lastPast = past[past.length - 1];

  return (
    <div className="@container">
      {upcoming.length > 0 && (
        <Section title={t("nextServices")} className="mt-0">
          <div className={cn(CARD, "border-secondary/30 bg-secondary/5")}>
            <div className="divide-y divide-secondary/15">
              {upcomingMonths.map((month, index) => (
                <section key={month.key} className="divide-y divide-secondary/15">
                  <MonthBand label={monthLabel(month.date)} tone="upcoming" first={index === 0} />
                  {month.items.map((service) => (
                    <ServiceRow
                      key={service.slug}
                      service={service}
                      badge={service === upcoming[0] ? nextBadge(service) : undefined}
                      timeline={{
                        tone: "upcoming",
                        last: service === lastUpcoming,
                        highlight: service === upcoming[0],
                      }}
                    />
                  ))}
                </section>
              ))}
            </div>
          </div>
        </Section>
      )}

      {pastMonths.length > 0 && (
        <Section title={t("history")} className={upcoming.length === 0 ? "mt-0" : undefined}>
          <div className={cn(CARD, "bg-background")}>
            <div className="divide-y divide-border">
              {/* cabeçalho de colunas, como na lista de músicas: no estreito mostra o total */}
              <div className={cn(ROW_GRID, "items-center bg-zinc-50 py-3 text-sm font-medium text-muted-foreground")}>
                <span className="col-span-3 [grid-row:1] @[720px]:hidden">
                  {t("totalServices", { count: past.length })}
                </span>
                <span className="hidden text-right @[720px]:block">{t("colDate")}</span>
                <span aria-hidden className="hidden @[720px]:block" />
                <span className="hidden @[720px]:block">{t("colService")}</span>
                <span className="hidden @[720px]:block">{t("colPreacherTheme")}</span>
                <span className="hidden @[720px]:block">{t("colSongs")}</span>
                <span className="hidden @[720px]:block" aria-hidden />
              </div>
              {pastMonths.map((month, index) => (
                <section key={month.key} className="divide-y divide-border">
                  <MonthBand label={monthLabel(month.date)} tone="past" first={index === 0} />
                  {month.items.map((service) => (
                    <ServiceRow
                      key={service.slug}
                      service={service}
                      timeline={{ tone: "past", first: service === firstPast, last: service === lastPast }}
                    />
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
