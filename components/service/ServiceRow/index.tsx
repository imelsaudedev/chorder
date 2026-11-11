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
  "@[720px]:grid-cols-[3rem_minmax(0,1.4fr)_minmax(0,1.6fr)_5rem_2.5rem]";

/** Respiro lateral e entre colunas: os mesmos da lista de músicas (SongsTable / SongRow flush). */
export const SERVICE_ROW_PAD = "px-4 @[560px]:px-5 @[860px]:px-6";
export const SERVICE_ROW_GAP = "gap-x-4 @[560px]:gap-x-5";

type ServiceRowProps = {
  service: ServiceListItem;
  /** Selo ao lado do título (ex.: "Esta semana"), usado no próximo culto. */
  badge?: string;
};

/**
 * Item da lista de liturgias (a lista precisa ser `@container`).
 *   estreito — data | título, depois dirigente, pregador(a), tema e texto e músicas numa linha corrida | ⋯
 *   ≥720px   — Data | Culto e dirigente | Pregador(a) e tema/texto | Músicas | ⋯
 * Alinhado pelo topo; o passo de linha é 22px, como na lista de músicas.
 */
export default function ServiceRow({ service, badge }: ServiceRowProps) {
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
        "grid-cols-[3rem_minmax(0,1fr)_2.5rem] [grid-template-areas:'when_title_act'_'when_meta_act']",
        SERVICE_ROW_GRID,
        "@[720px]:[grid-template-areas:'when_title_pre_songs_act'_'when_leader_tema_songs_act']"
      )}
    >
      <Link href={`/services/${local.slug}`} className="absolute inset-0 z-0" aria-label={title} />

      {/* data: dia da semana + número (o mês vem do grupo da lista) */}
      <div className="pointer-events-none relative z-10 pt-0.5 text-center leading-none [grid-area:when]">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-secondary">{weekday}</div>
        <div className="font-display text-[22px] font-semibold leading-[26px] tracking-tight text-primary">
          {String(date.getDate()).padStart(2, "0")}
        </div>
      </div>

      <div className="pointer-events-none relative z-10 min-w-0 [grid-area:title]">
        <Text variant="heading-sm" as="p" className="flex items-baseline gap-2 leading-[22px] @[860px]:text-lg">
          <span className="truncate">{title}</span>
          {badge && (
            <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-secondary">{badge}</span>
          )}
        </Text>
      </div>

      {/* dirigente, pregador(a), tema e texto, músicas: linha corrida no estreito, colunas no largo */}
      <div className="pointer-events-none relative z-10 flex min-w-0 flex-wrap gap-x-3 text-sm leading-[22px] text-muted-foreground [grid-area:meta] @[720px]:contents">
        {local.worshipLeader && (
          <span className="inline-flex min-w-0 items-center gap-1 @[720px]:[grid-area:leader]">
            <MicVocal className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">{local.worshipLeader}</span>
          </span>
        )}
        {local.preacher ? (
          <span className="inline-flex min-w-0 items-center gap-1 @[720px]:[grid-area:pre]">
            <MessageSquare className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">{local.preacher}</span>
          </span>
        ) : (
          placeholder("@[720px]:[grid-area:pre]")
        )}
        {themeAndText ? (
          <span className="min-w-0 truncate @[720px]:[grid-area:tema]">{themeAndText}</span>
        ) : (
          placeholder("@[720px]:[grid-area:tema]")
        )}
        {local.songCount > 0 ? (
          <span className="inline-flex items-center gap-1 whitespace-nowrap @[720px]:[grid-area:songs]">
            <Music className="size-3.5 shrink-0" aria-hidden />
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
