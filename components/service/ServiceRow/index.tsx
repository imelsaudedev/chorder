"use client";

import Text from "@/components/common/Text";
import ServiceMetaModal, { ServiceMeta } from "@/components/service/ServiceMetaModal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ServiceListItem } from "@/prisma/models";
import { MessageSquare, MicVocal, MoreVertical, Music, Pencil } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { useSWRConfig } from "swr";

/** Colunas do desktop; o cabeçalho da lista usa a mesma grade (ver `SERVICE_ROW_GRID`). */
export const SERVICE_ROW_GRID =
  "@[720px]:grid-cols-[4.5rem_1.5rem_minmax(0,1.4fr)_minmax(0,1.6fr)_5rem_2.5rem]";
/** Colunas do estreito: data | trilho | conteúdo | ⋯. */
export const SERVICE_ROW_GRID_NARROW = "grid-cols-[3.75rem_1.5rem_minmax(0,1fr)_2.5rem]";

/** Respiro lateral e entre colunas: os mesmos da lista de músicas (SongsTable / SongRow flush). */
export const SERVICE_ROW_PAD = "px-4 @[560px]:px-5 @[860px]:px-6";
export const SERVICE_ROW_GAP = "gap-x-4 @[560px]:gap-x-5";

/** Posição do item no trilho da linha do tempo. */
export type TimelineTone = "upcoming" | "past";
export type ServiceTimeline = {
  tone: TimelineTone;
  /** Primeiro/último do trilho: a linha começa/termina no ponto. */
  first?: boolean;
  last?: boolean;
  /** Próximo culto: ponto maior com halo. */
  highlight?: boolean;
};

const RAIL_COLOR: Record<TimelineTone, string> = {
  upcoming: "bg-secondary/40",
  past: "bg-border-strong",
};

/**
 * Linha vertical do trilho. `-my-4` estende a célula sobre o respiro da linha, assim a linha é contínua
 * entre os itens. `startAt`/`endAt` (27px = respiro de 16 + meio da linha do título) fazem a linha
 * começar ou terminar no ponto.
 */
export function TimelineRail({
  tone,
  first,
  last,
  children,
  className,
  inBand = false,
}: {
  tone: TimelineTone;
  first?: boolean;
  last?: boolean;
  children?: React.ReactNode;
  className?: string;
  /** Faixa/cabeçalho (sem áreas nomeadas): coluna 2 da grade, altura da faixa. */
  inBand?: boolean;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "relative self-stretch",
        inBand ? "col-start-2 row-start-1" : "-my-4 [grid-area:rail]",
        className
      )}
    >
      <span
        className={cn(
          "absolute left-1/2 w-0.5 -translate-x-1/2",
          RAIL_COLOR[tone],
          first ? "top-[27px]" : "top-0",
          last ? "bottom-[calc(100%-27px)]" : "bottom-0"
        )}
      />
      {children}
    </div>
  );
}

type ServiceRowProps = {
  service: ServiceListItem;
  /** Selo ao lado do título (ex.: "Esta semana"), usado no próximo culto. */
  badge?: string;
  /** Liga o trilho da linha do tempo (ponto + linha). */
  timeline?: ServiceTimeline;
};

/**
 * Item da lista de liturgias (a lista precisa ser `@container`).
 *   estreito — data | trilho | título, depois dirigente, pregador(a), tema e texto e músicas numa linha corrida | ⋯
 *   ≥720px   — Data | trilho | Culto e dirigente | Pregador(a) e tema/texto | Músicas | ⋯
 * Alinhado pelo topo; o passo de linha é 22px, como na lista de músicas. Data, ponto do trilho e
 * título compartilham o mesmo corpo de fonte e o centro da primeira linha.
 */
export default function ServiceRow({ service, badge, timeline }: ServiceRowProps) {
  const t = useTranslations();
  const locale = useLocale();
  const { mutate } = useSWRConfig();
  const [metaOpen, setMetaOpen] = useState(false);
  const [local, setLocal] = useState(service);
  const [saving, setSaving] = useState(false);

  useEffect(() => setLocal(service), [service]);

  const date = useMemo(() => new Date(String(local.date)), [local.date]);
  const weekday = useMemo(
    () => date.toLocaleDateString(locale, { weekday: "short" }).replace(".", ""),
    [date, locale]
  );
  const title = local.title?.trim() || t("Service.noTitle");
  const themeAndText = [local.sermonTheme, local.sermonReference].filter(Boolean).join(" · ");

  function handleMetaSave(values: ServiceMeta): false {
    setSaving(true);
    fetch(`/api/services/${local.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    })
      .then((res) => {
        if (!res.ok) return;
        setLocal((prev) => ({ ...prev, ...values }));
        setMetaOpen(false);
        mutate((key) => typeof key === "string" && key.startsWith("/api/services"));
      })
      .catch(() => {})
      .finally(() => setSaving(false));
    return false;
  }

  const placeholder = (extra?: string) => (
    <span aria-hidden className={cn("hidden @[720px]:inline", extra)}>
      —
    </span>
  );

  return (
    <li
      data-service-row
      className={cn(
        "relative grid items-start py-4 transition-colors hover:bg-muted/40",
        SERVICE_ROW_PAD,
        SERVICE_ROW_GAP,
        SERVICE_ROW_GRID_NARROW,
        "[grid-template-areas:'when_rail_title_act'_'when_rail_meta_act']",
        SERVICE_ROW_GRID,
        "@[720px]:[grid-template-areas:'when_rail_title_pre_songs_act'_'when_rail_leader_tema_songs_act']"
      )}
    >
      <Link href={`/services/${local.slug}`} className="absolute inset-0 z-0" aria-label={title} />

      {/* data: dia da semana (maiúscula, leve) + número (negrito), no corpo do título; o mês vem da faixa do grupo */}
      {/* o dia da semana usa a fonte do corpo em peso normal (a fonte de títulos só carrega o peso 600) */}
      <div className="pointer-events-none relative z-10 whitespace-nowrap text-right text-base leading-[22px] text-muted-foreground [grid-area:when] @[860px]:text-lg">
        <span className="font-sans font-normal uppercase tracking-wide">{weekday}</span>{" "}
        <span className="font-display font-semibold tracking-tight text-primary">
          {String(date.getDate()).padStart(2, "0")}
        </span>
      </div>

      <TimelineRail tone={timeline?.tone ?? "past"} first={timeline?.first} last={timeline?.last} className={timeline ? undefined : "invisible"}>
        {timeline && (
          <span
            className={cn(
              "absolute left-1/2 -translate-x-1/2 rounded-full",
              // culto realizado: ponto cheio; culto por vir: ponto vazado
              timeline.tone === "upcoming"
                ? "border-2 border-secondary bg-background"
                : "bg-faint-foreground",
              timeline.highlight
                ? "top-[19px] size-4 shadow-[0_0_0_5px] shadow-secondary/20"
                : "top-[21px] size-3"
            )}
          />
        )}
      </TimelineRail>

      <div className="pointer-events-none relative z-10 min-w-0 [grid-area:title]">
        <Text variant="heading-sm" as="p" className="flex items-baseline gap-2 leading-[22px] @[860px]:text-lg">
          <span className="min-w-0 @[720px]:truncate">{title}</span>
          {badge && (
            <span className="hidden shrink-0 text-xs font-semibold uppercase tracking-wider text-secondary @[720px]:inline">
              {badge}
            </span>
          )}
        </Text>
      </div>

      {/* dirigente, pregador(a), tema e texto, músicas: linha corrida no estreito, colunas no largo */}
      <div className="pointer-events-none relative z-10 flex min-w-0 flex-wrap gap-x-3 text-sm leading-[22px] text-muted-foreground [grid-area:meta] @[720px]:contents">
        {badge && (
          <span className="w-full text-xs font-semibold uppercase tracking-wider text-secondary @[720px]:hidden">
            {badge}
          </span>
        )}
        {local.worshipLeader && (
          <span className="inline-flex min-w-0 items-start gap-1 @[720px]:[grid-area:leader]">
            <MicVocal className="mt-1 size-3.5 shrink-0" aria-hidden />
            <span className="min-w-0 @[720px]:truncate">{local.worshipLeader}</span>
          </span>
        )}
        {local.preacher ? (
          <span className="inline-flex min-w-0 items-start gap-1 @[720px]:[grid-area:pre]">
            <MessageSquare className="mt-1 size-3.5 shrink-0" aria-hidden />
            <span className="min-w-0 @[720px]:truncate">{local.preacher}</span>
          </span>
        ) : (
          placeholder("@[720px]:[grid-area:pre]")
        )}
        {themeAndText ? (
          <span className="min-w-0 @[720px]:[grid-area:tema] @[720px]:truncate">{themeAndText}</span>
        ) : (
          placeholder("@[720px]:[grid-area:tema]")
        )}
        {local.songCount > 0 ? (
          <span className="inline-flex items-start gap-1 whitespace-nowrap @[720px]:[grid-area:songs]">
            <Music className="mt-1 size-3.5 shrink-0" aria-hidden />
            {local.songCount}
            <span className="sr-only">{t("Service.colSongs")}</span>
          </span>
        ) : (
          placeholder("@[720px]:[grid-area:songs]")
        )}
      </div>

      <div className="relative z-10 -mt-2 flex justify-end [grid-area:act]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 hover:bg-muted/40 data-[state=open]:bg-muted/40"
              aria-label="Mais ações"
            >
              <MoreVertical size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setMetaOpen(true)}>
              <Pencil size={14} className="mr-2" />
              {t("Messages.editServiceData")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ServiceMetaModal
        open={metaOpen}
        onOpenChange={setMetaOpen}
        isNew={false}
        defaultValues={{ title: local.title ?? "", worshipLeader: local.worshipLeader ?? "", date }}
        onSave={handleMetaSave}
        loading={saving}
      />
    </li>
  );
}
