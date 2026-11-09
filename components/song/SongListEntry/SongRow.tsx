"use client";

import { useUpdateSong } from "#api-client";
import HighlightKeyword from "@/components/common/HighlightKeyword";
import Text from "@/components/common/Text";
import SongMetaModal, { SongMetaSavePayload } from "@/components/song/SongMetaModal";
import SongReferences from "@/components/song/SongReferences";
import TagList from "@/components/song/TagList";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatTimeAgo } from "@/lib/relative-time";
import { cn } from "@/lib/utils";
import { ClientSong } from "@/prisma/models";
import { Clock, MoreVertical, NotebookPen, Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSWRConfig } from "swr";

const RECENT_DAYS = 21;
const DAY_MS = 86_400_000;

/** Primeiras linhas cantáveis da letra (pula marcadores de seção). */
function leadLines(lyrics: string, count: number): string[] {
  const out: string[] = [];
  for (const raw of lyrics.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("{")) continue;
    if (line.length < 40 && /^[^\n]{1,30}:$/.test(line)) continue;
    out.push(line);
    if (out.length === count) break;
  }
  return out;
}

/** Relógio + "há 2 semanas"; âmbar se foi nas últimas 3 semanas, "Nunca usada" em itálico. */
export function LastUsed({ date, className }: { date: Date | string | null; className?: string }) {
  if (!date) {
    return (
      <span className={cn("inline-flex items-center gap-1 text-sm italic text-muted-foreground whitespace-nowrap", className)}>
        <Clock size={14} aria-hidden /> Nunca usada
      </span>
    );
  }
  const d = typeof date === "string" ? new Date(date) : date;
  const recent = Date.now() - d.getTime() < RECENT_DAYS * DAY_MS;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-sm whitespace-nowrap",
        recent ? "text-amber-700" : "text-muted-foreground",
        className
      )}
    >
      <Clock size={14} aria-hidden /> {formatTimeAgo(d)}
    </span>
  );
}

/**
 * Item da lista de músicas (navegação).
 *
 * Largura do contêiner (a lista precisa ser `@container`):
 *   celular  — título, autor · último uso | referências | ⋯
 *   ≥560px   — duas colunas: identidade | letra + categorias | referências | ⋯
 *   ≥860px   — seis colunas: título | letra | categorias | uso | referências | ⋯
 * Alinhado pelo topo. Tocar na linha abre a música.
 */
export default function SongRow({
  song,
  query = "",
  flush = false,
}: {
  song: ClientSong;
  query?: string;
  /** Dentro do cartão da lista: sem margem negativa; o respiro lateral acompanha o cabeçalho. */
  flush?: boolean;
}) {
  const [metaOpen, setMetaOpen] = useState(false);
  const { updateSong } = useUpdateSong(song.slug);
  const { mutate } = useSWRConfig();
  const router = useRouter();

  const arrangements = (song.arrangements ?? []).filter((a) => !a.isServiceArrangement && !a.isDeleted);
  const mainArrangement = arrangements.find((a) => a.isDefault) ?? arrangements[0];
  const lyric = leadLines(song.lyrics, 2);
  const tags = song.tags ?? [];
  // Só mostra o uso quando a lista pediu as estatísticas.
  const hasUsage = song.usageCount !== undefined;

  function handleMetaSave(payload: SongMetaSavePayload) {
    updateSong({ title: payload.title, artist: payload.artist ?? null, tagIds: payload.tagIds }).then(() =>
      mutate((key) => Array.isArray(key) && key[0] === "/api/songs")
    );
  }

  return (
    <>
      <div
        data-song-row
        className={cn(
          "group relative grid items-start gap-x-4 py-4 transition-colors hover:bg-muted/40",
          flush ? "px-4 @[560px]:px-5 @[860px]:px-6" : "px-3 -mx-3 @[560px]:px-4 @[560px]:-mx-4",
          "grid-cols-[minmax(0,1fr)_3.5rem_2.5rem] [grid-template-areas:'id_play_act']",
          "@[560px]:gap-x-5",
          "@[560px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_3.5rem_2.5rem]",
          "@[560px]:[grid-template-areas:'id_lyric_play_act'_'id_tags_play_act']",
          "@[860px]:grid-cols-[minmax(0,2.3fr)_minmax(0,2.4fr)_minmax(0,1.6fr)_11rem_3.5rem_2.5rem]",
          "@[860px]:[grid-template-areas:'id_lyric_tags_used_play_act']"
        )}
      >
        <Link href={`/songs/${song.slug}`} className="absolute inset-0 z-0" aria-label={song.title} />

        {/* título, autor e último uso */}
        <div className="relative z-10 min-w-0 pointer-events-none [grid-area:id]">
          <Text variant="heading-sm" as="p" className="truncate @[860px]:text-lg">
            <HighlightKeyword text={song.title} keyword={query} />
          </Text>
          <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground @[560px]:flex-col @[560px]:items-start @[560px]:gap-0">
            {song.artist && (
              <>
                <span className="min-w-0 truncate max-w-full">
                  <HighlightKeyword text={song.artist} keyword={query} />
                </span>
                {hasUsage && <span aria-hidden className="@[560px]:hidden">·</span>}
              </>
            )}
            {hasUsage && <LastUsed date={song.lastUsedAt ?? null} className="shrink-0 @[860px]:hidden" />}
          </div>
        </div>

        {/* letra: duas linhas, a partir do tablet */}
        <div className="relative z-10 hidden min-w-0 pointer-events-none @[560px]:block [grid-area:lyric]">
          {lyric.map((line, i) => (
            <Text key={i} variant="caption" as="p" className="truncate text-sm leading-5">
              <HighlightKeyword text={line} keyword={query} />
            </Text>
          ))}
        </div>

        {/* categorias: até 2 linhas, a partir do tablet */}
        {tags.length > 0 && (
          <div className="relative z-10 hidden min-w-0 @[560px]:block @[560px]:mt-2 @[860px]:mt-0 [grid-area:tags]">
            <TagList tags={tags} maxLines={2} />
          </div>
        )}

        {/* último uso e contagem: coluna própria no desktop */}
        {hasUsage && (
          <div className="relative z-10 hidden items-center gap-1.5 whitespace-nowrap pt-0.5 pointer-events-none @[860px]:flex [grid-area:used]">
            <LastUsed date={song.lastUsedAt ?? null} />
            {!!song.usageCount && <span className="text-sm text-muted-foreground">· {song.usageCount}×</span>}
          </div>
        )}

        {/* referências */}
        <div className="relative z-10 -mt-2 flex justify-center [grid-area:play]">
          <SongReferences arrangements={arrangements} title={song.title} />
        </div>

        {/* ⋯ */}
        <div className="relative z-10 -mt-2 flex justify-end [grid-area:act]">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="icon" className="h-10 w-10 hover:bg-muted/40 data-[state=open]:bg-muted/40" aria-label="Mais ações">
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setMetaOpen(true)}>
                <Pencil size={14} className="mr-2" />
                Editar dados
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => router.push(`/songs/${song.slug}/edit?arrangement=${mainArrangement?.id}`)}
              >
                <NotebookPen size={14} className="mr-2" />
                Editar arranjo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <SongMetaModal
        open={metaOpen}
        onOpenChange={setMetaOpen}
        isNew={false}
        defaultValues={{ title: song.title, artist: song.artist ?? "" }}
        onSave={handleMetaSave}
      />
    </>
  );
}
