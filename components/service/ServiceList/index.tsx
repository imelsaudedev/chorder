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
import ServiceFilterBar from "@/components/service/ServiceFilterBar";
import { Button } from "@/components/ui/button";
import useServicesListState from "@/hooks/useServicesListState";
import { cn } from "@/lib/utils";
import { daysUntil, groupByMonth, splitUpcomingAndPast } from "@/lib/service-list";
import {
  effectiveGroup,
  filterOptions,
  filterServices,
  groupServices,
  hasActiveFilters,
  sortServices,
} from "@/lib/services-list-state";
import { ServiceListItem } from "@/prisma/models";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

type ServiceListProps = {
  services: ServiceListItem[];
};

// Cartão da lista: o mesmo da lista de músicas (borda, canto, sombra; no celular vai de ponta a ponta).
const CARD = "overflow-clip rounded-xl border shadow-xs max-sm:-mx-page max-sm:rounded-none max-sm:border-x-0";

/** Mesma grade da linha (data | trilho | conteúdo), para faixas e cabeçalho alinharem com os itens. */
const ROW_GRID = cn("grid", SERVICE_ROW_PAD, SERVICE_ROW_GAP, SERVICE_ROW_GRID_NARROW, SERVICE_ROW_GRID);

/** Quantas liturgias o histórico mostra antes do "Mostrar mais" (a busca e os filtros abrem tudo). */
const HISTORY_PAGE = 60;

/** Faixa do grupo (mês, ano, dirigente): o trilho atravessa a faixa; o texto começa na coluna do título. */
function GroupBand({ label, tone, first, rail = true }: { label: string; tone: TimelineTone; first?: boolean; rail?: boolean }) {
  return (
    <h3
      className={cn(
        ROW_GRID,
        "h-8 items-center text-sm font-semibold uppercase text-secondary",
        tone === "upcoming" ? "bg-secondary/10" : "bg-zinc-50"
      )}
    >
      {/* a faixa do primeiro mês não leva trilho: a linha começa no primeiro ponto */}
      {rail && !first ? <TimelineRail tone={tone} inBand /> : null}
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
  const { state, update, clearFilters } = useServicesListState();
  const [expanded, setExpanded] = useState(false);
  const [searchKey, setSearchKey] = useState(0);

  const options = useMemo(() => filterOptions(past), [past]);
  const filtering = hasActiveFilters(state);
  const group = effectiveGroup(state);
  // Linha do tempo só quando a ordem é por data e os grupos não a interrompem.
  const showRail = state.sort.key === "date" && group !== "leader";

  const visible = useMemo(() => {
    const shown = sortServices(filterServices(past, state), state.sort);
    const groups = groupServices(shown, group, t("noLeaderGroup"));
    if (filtering || expanded) return { groups, total: shown.length, hidden: 0 };
    // Corta na fronteira de um grupo, para nunca deixar um mês pela metade.
    const kept: typeof groups = [];
    let count = 0;
    for (const g of groups) {
      if (count >= HISTORY_PAGE) break;
      kept.push(g);
      count += g.items.length;
    }
    return { groups: kept, total: shown.length, hidden: shown.length - count };
  }, [past, state, group, filtering, expanded, t]);

  const flat = visible.groups.flatMap((g) => g.items);
  const firstShown = flat[0];
  const lastShown = flat[flat.length - 1];

  function groupLabel(g: (typeof visible.groups)[number]) {
    if (g.date) return monthLabel(g.date);
    return g.label;
  }

  function handleClear() {
    clearFilters();
    setSearchKey((k) => k + 1);
  }

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

  return (
    <div className="@container">
      {upcoming.length > 0 && (
        <Section title={t("nextServices")}>
          <div className={cn(CARD, "border-secondary/30 bg-secondary/5")}>
            <div className="divide-y divide-secondary/15">
              {upcomingMonths.map((month, index) => (
                <section key={month.key} className="divide-y divide-secondary/15">
                  <GroupBand label={monthLabel(month.date)} tone="upcoming" first={index === 0} />
                  {month.items.map((service) => (
                    <ServiceRow
                      key={service.slug}
                      service={service}
                      badge={service === upcoming[0] ? nextBadge(service) : undefined}
                      timeline={{
                        tone: "upcoming",
                        first: service === upcoming[0],
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

      {past.length > 0 && (
        <Section title={t("history")}>
          <ServiceFilterBar state={state} onChange={update} options={options} searchKey={searchKey} />

          {filtering && (
            <p className="-mt-2 mb-4 flex items-center gap-2 text-sm text-muted-foreground">
              {t("results", { count: visible.total })}
              <Button type="button" variant="link" size="sm" className="h-auto p-0 text-sm" onClick={handleClear}>
                {t("clearFilters")}
              </Button>
            </p>
          )}

          <div className={cn(CARD, "bg-background")}>
            {visible.total === 0 ? (
              <div className="flex flex-col items-center gap-1 px-4 py-12 text-center">
                <p className="font-medium">{t("emptyTitle")}</p>
                <p className="text-sm text-muted-foreground">{t("emptyHint")}</p>
                <Button type="button" variant="soft" size="sm" className="mt-3" onClick={handleClear}>
                  {t("clearFilters")}
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {/* cabeçalho de colunas, como na lista de músicas: no estreito mostra o total */}
                <div className={cn(ROW_GRID, "items-center bg-zinc-50 py-3 text-sm font-medium text-muted-foreground")}>
                  <span className="col-span-3 [grid-row:1] @[720px]:hidden">
                    {t("totalServices", { count: visible.total })}
                  </span>
                  <span className="hidden text-right @[720px]:block">{t("colDate")}</span>
                  <span aria-hidden className="hidden @[720px]:block" />
                  <span className="hidden @[720px]:block">{t("colService")}</span>
                  <span className="hidden @[720px]:block">{t("colPreacherTheme")}</span>
                  <span className="hidden @[720px]:block">{t("colSongs")}</span>
                  <span className="hidden @[720px]:block" aria-hidden />
                </div>
                {visible.groups.map((g, index) => (
                  <section key={g.key} className="divide-y divide-border">
                    {group !== "none" && (
                      <GroupBand label={groupLabel(g) ?? ""} tone="past" first={index === 0} rail={showRail} />
                    )}
                    {g.items.map((service) => (
                      <ServiceRow
                        key={service.slug}
                        service={service}
                        timeline={
                          showRail
                            ? { tone: "past", first: service === firstShown, last: service === lastShown }
                            : undefined
                        }
                      />
                    ))}
                  </section>
                ))}
              </div>
            )}
          </div>

          {visible.hidden > 0 && (
            <div className="mt-3 flex justify-center">
              <Button type="button" variant="soft" size="sm" onClick={() => setExpanded(true)}>
                {t("showMore", { count: visible.hidden })}
              </Button>
            </div>
          )}
        </Section>
      )}
    </div>
  );
}
