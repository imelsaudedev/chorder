"use client";

import ExpandingSearch from "@/components/song/SongsFilterBar/ExpandingSearch";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SERVICE_GROUPS,
  SERVICE_SORT_KEYS,
  ServiceGroupBy,
  ServiceSort,
  ServiceSortKey,
  ServicesListState,
  defaultServiceDir,
  effectiveGroup,
} from "@/lib/services-list-state";
import { ArrowDown, ArrowUp, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import FilterPicker from "./FilterPicker";

type ServiceFilterBarProps = {
  state: ServicesListState;
  onChange: (patch: Partial<ServicesListState>) => void;
  options: { years: number[]; leaders: string[]; preachers: string[] };
  /** Muda quando os filtros são limpos de fora, para a busca esvaziar o campo. */
  searchKey: number;
};

/**
 * Filtros do histórico, no desenho da lista de Músicas: seletores à esquerda; busca e ordenação
 * à direita (tablet e desktop) ou numa segunda linha (celular).
 */
export default function ServiceFilterBar({ state, onChange, options, searchKey }: ServiceFilterBarProps) {
  const t = useTranslations("Service");
  const group = effectiveGroup(state);
  const Arrow = state.sort.dir === "asc" ? ArrowUp : ArrowDown;

  function pickSort(key: ServiceSortKey) {
    const sort: ServiceSort =
      key === state.sort.key
        ? { key, dir: state.sort.dir === "asc" ? "desc" : "asc" }
        : { key, dir: defaultServiceDir(key) };
    // Mudar o eixo da ordenação volta o agrupamento ao padrão dele.
    onChange({ sort, group: key === state.sort.key ? state.group : null });
  }

  const sortLabel: Record<ServiceSortKey, string> = {
    date: t("sortDate"),
    title: t("sortTitle"),
    leader: t("sortLeader"),
  };
  const groupLabel: Record<ServiceGroupBy, string> = {
    month: t("groupMonth"),
    year: t("groupYear"),
    leader: t("groupLeader"),
    none: t("groupNone"),
  };

  return (
    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="no-scrollbar flex gap-2 overflow-x-auto sm:flex-1 sm:flex-wrap sm:overflow-visible">
        <FilterPicker
          single
          label={t("filterYear")}
          clearLabel={t("clearFilter", { name: t("filterYear") })}
          options={options.years.map(String)}
          selected={state.year ? [String(state.year)] : []}
          onChange={(v) => onChange({ year: v[0] ? Number(v[0]) : null })}
        />
        <FilterPicker
          label={t("filterLeader")}
          clearLabel={t("clearFilter", { name: t("filterLeader") })}
          options={options.leaders}
          selected={state.leaders}
          onChange={(leaders) => onChange({ leaders })}
        />
        <FilterPicker
          label={t("filterPreacher")}
          clearLabel={t("clearFilter", { name: t("filterPreacher") })}
          options={options.preachers}
          selected={state.preachers}
          onChange={(preachers) => onChange({ preachers })}
        />
      </div>
      <div className="flex items-center gap-2 sm:ml-auto sm:justify-end">
        <ExpandingSearch
          key={searchKey}
          value={state.query}
          placeholder={t("searchPlaceholder")}
          onSearch={(query) => onChange({ query })}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="soft" size="sm" aria-label={t("sortAria")}>
              <Arrow className="size-3.5" />
              {sortLabel[state.sort.key]}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">{t("sortBy")}</DropdownMenuLabel>
            {SERVICE_SORT_KEYS.map((key) => (
              <DropdownMenuItem
                key={key}
                onSelect={(e) => {
                  e.preventDefault();
                  pickSort(key);
                }}
                className="justify-between gap-6"
              >
                {sortLabel[key]}
                {key === state.sort.key && <Arrow className="size-3.5" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">{t("groupBy")}</DropdownMenuLabel>
            {SERVICE_GROUPS.map((g) => (
              <DropdownMenuItem
                key={g}
                onSelect={(e) => {
                  e.preventDefault();
                  onChange({ group: g });
                }}
                className="justify-between gap-6"
              >
                {groupLabel[g]}
                {g === group && <Check className="size-3.5" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
