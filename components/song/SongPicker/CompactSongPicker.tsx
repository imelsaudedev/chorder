"use client";

import { useFetchSongs, useFetchTagGroups } from "#api-client";
import HighlightKeyword from "@/components/common/HighlightKeyword";
import LastUsedIndicator from "@/components/song/LastUsedIndicator";
import { getVerse1Lines } from "@/components/song/SongListEntry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientSong } from "@/prisma/models";
import { ArrowUp, ChevronRight, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { ActiveFilterChips, FiltersPanel, FiltersToggle } from "./CompactTagFilters";

// Variação do seletor de músicas para espaços estreitos (painel e tela cheia
// do editor de liturgia). Diferente de SongPicker/SongList — que escolhem o
// layout pela largura da *janela* e quebram dentro de um painel de ~400px —,
// aqui cada música é uma linha de toque única, em coluna:
//   título / último uso + arranjos / primeira linha da letra            ›
// O topo (busca, filtros por tag) fica fixo; só a lista rola.
//
// Funil: tags estreitam o catálogo → a busca atua dentro do que sobrou → o
// índice de letras navega o resultado atual (só aparece quando ajuda).

// Abaixo disso o índice de letras não compensa.
const MIN_SONGS_FOR_LETTER_INDEX = 15;

type CompactSongPickerProps = {
  onSelected: (song: ClientSong) => void;
  /** Filtros por tag controlados por quem usa (para durarem enquanto o editor estiver aberto). */
  tagIds?: number[];
  onTagIdsChange?: (tagIds: number[]) => void;
};

function initialOf(title: string): string {
  return title
    .trim()
    .charAt(0)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "");
}

function countArrangements(song: ClientSong): number {
  return (song.arrangements ?? []).filter((a) => !a.isServiceArrangement && !a.isDeleted).length;
}

export default function CompactSongPicker({
  onSelected,
  tagIds: controlledTagIds,
  onTagIdsChange,
}: CompactSongPickerProps) {
  const [query, setQuery] = useState("");
  const [localTagIds, setLocalTagIds] = useState<number[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const tagIds = controlledTagIds ?? localTagIds;
  const setTagIds = onTagIdsChange ?? setLocalTagIds;

  const { tagGroups } = useFetchTagGroups();
  const { songs, isLoading, isError } = useFetchSongs({
    query,
    tagIds,
    limitLines: 3,
    forceIncludeFirstLine: true,
    withUsageStats: true,
  });
  const handleSearch = useDebouncedCallback(setQuery, 300);
  const listRef = useRef<HTMLDivElement>(null);

  // Mudou a busca ou os filtros: a lista é outra, então volta ao topo.
  const tagKey = tagIds.join(",");
  useEffect(() => {
    listRef.current?.scrollTo({ top: 0 });
    setShowTop(false);
  }, [query, tagKey]);

  const groups = useMemo(() => {
    const byLetter = new Map<string, ClientSong[]>();
    (songs ?? []).forEach((song) => {
      const letter = initialOf(song.title);
      byLetter.set(letter, [...(byLetter.get(letter) ?? []), song]);
    });
    byLetter.forEach((list) => list.sort((a, b) => a.title.localeCompare(b.title, "pt-BR")));
    return Array.from(byLetter.entries()).sort(([a], [b]) => a.localeCompare(b, "pt-BR"));
  }, [songs]);

  function jumpTo(letter: string) {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-letter="${letter}"]`)
      ?.scrollIntoView({ block: "start" });
  }

  function toggleTag(tagId: number) {
    setTagIds(tagIds.includes(tagId) ? tagIds.filter((id) => id !== tagId) : [...tagIds, tagId]);
  }

  function handleListScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    setShowTop(el.scrollTop > Math.max(480, el.clientHeight * 1.5));
  }

  function backToTop() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    listRef.current?.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }

  const isReady = !!songs && !isLoading;
  const total = songs?.length ?? 0;
  const hasFilters = tagIds.length > 0;
  const showLetterIndex = !query && total > MIN_SONGS_FOR_LETTER_INDEX && groups.length > 1;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Topo fixo: busca + filtros */}
      <div className="shrink-0 border-b border-border px-4 pb-2 pt-3">
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search
              size={16}
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              aria-label="Buscar música"
              placeholder="Buscar por título, artista ou letra"
              className="h-11 rounded-full pl-10"
              defaultValue={query}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          {tagGroups.length > 0 && (
            <FiltersToggle
              activeCount={tagIds.length}
              open={filtersOpen}
              onToggle={() => setFiltersOpen((open) => !open)}
            />
          )}
        </div>

        <ActiveFilterChips tagGroups={tagGroups} selectedTagIds={tagIds} onRemove={toggleTag} />

        {filtersOpen && (
          <FiltersPanel
            tagGroups={tagGroups}
            selectedTagIds={tagIds}
            onToggleTag={toggleTag}
            onClear={() => setTagIds([])}
          />
        )}
      </div>

      {/* Lista (única parte que rola) */}
      <div className="relative min-h-0 flex-1">
        <div ref={listRef} onScroll={handleListScroll} className="h-full overflow-y-auto">
          {!isReady && !isError && <ListSkeleton />}

          {isError && (
            <p role="alert" className="px-4 py-12 text-center text-sm text-destructive">
              Não foi possível carregar as músicas. Tente novamente.
            </p>
          )}

          {isReady && !isError && total === 0 && (
            <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
              <p className="text-sm text-muted-foreground">
                Nenhuma música encontrada
                {query ? <> para “{query}”</> : null}
                {hasFilters ? " com esses filtros" : null}.
              </p>
              {hasFilters && (
                <Button type="button" variant="outline" className="h-11" onClick={() => setTagIds([])}>
                  Limpar filtros
                </Button>
              )}
            </div>
          )}

          {isReady && total > 0 && (
            <>
              <p aria-live="polite" className="px-4 pb-1 pt-3 text-xs text-muted-foreground">
                {total} {total === 1 ? "música" : "músicas"}
                {query || hasFilters ? (total === 1 ? " encontrada" : " encontradas") : ""}
              </p>

              {/* Atalho por letra: as letras do resultado atual, em grade (sem rolagem
                  escondida). Fica no topo da lista e rola junto; os cabeçalhos de letra
                  fixos cuidam da orientação depois. Some durante uma busca por texto e
                  quando o resultado é curto. */}
              {showLetterIndex && (
                <nav aria-label="Ir para a letra" className="px-3 pb-2">
                  <ul className="grid grid-cols-[repeat(auto-fill,minmax(2rem,1fr))] gap-0.5">
                    {groups.map(([letter]) => (
                      <li key={letter}>
                        <button
                          type="button"
                          onClick={() => jumpTo(letter)}
                          className="cursor-pointer h-9 w-full rounded-md font-display text-base font-semibold uppercase text-secondary hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        >
                          {letter}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
              {groups.map(([letter, list]) => (
                <section key={letter} data-letter={letter}>
                  <h3 className="sticky top-0 z-[1] border-b border-border bg-background px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-secondary">
                    {letter}
                  </h3>
                  <ul>
                    {list.map((song) => (
                      <SongRow key={song.slug} song={song} query={query} onSelected={onSelected} />
                    ))}
                  </ul>
                </section>
              ))}
            </>
          )}
        </div>

        {/* Voltar ao topo da lista (a lista rola num contêiner, não na janela) */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={backToTop}
          aria-label="Voltar ao topo da lista"
          aria-hidden={!showTop}
          tabIndex={showTop ? 0 : -1}
          className={`absolute bottom-3 right-3 size-11 rounded-full bg-background shadow-md transition-opacity duration-200 motion-reduce:transition-none ${
            showTop ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <ArrowUp className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}

function SongRow({
  song,
  query,
  onSelected,
}: {
  song: ClientSong;
  query: string;
  onSelected: (song: ClientSong) => void;
}) {
  const arrangementCount = countArrangements(song);
  // Sem busca, uma linha da letra basta para reconhecer a música; com busca, mostra
  // as linhas que combinaram.
  const lyricLines = getVerse1Lines(song.lyrics ?? "").slice(0, query ? 2 : 1);
  // O autor não faz parte da linha, exceto quando é o motivo de a música aparecer na busca.
  const artistMatchesQuery =
    !!query && !!song.artist && song.artist.toLocaleLowerCase().includes(query.toLocaleLowerCase());
  const hasMeta = arrangementCount > 1 || !!song.lastUsedAt || artistMatchesQuery;

  return (
    <li className="border-b border-border">
      <button
        type="button"
        onClick={() => onSelected(song)}
        className="cursor-pointer flex min-h-16 w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted/50 active:bg-muted/70 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/50"
      >
        <span className="min-w-0 flex-1">
          {/* 1. Título */}
          <span className="block truncate font-display text-base font-semibold leading-[22px] tracking-tight">
            <HighlightKeyword text={song.title} keyword={query} />
          </span>

          {/* 2. Último uso e quantidade de arranjos (só quando há mais de um) */}
          {hasMeta && (
            <span className="mt-0.5 flex min-w-0 items-center gap-3 text-xs text-muted-foreground">
              {artistMatchesQuery && song.artist && (
                <span className="min-w-0 truncate">
                  <HighlightKeyword text={song.artist} keyword={query} />
                </span>
              )}
              {song.lastUsedAt && <LastUsedIndicator date={song.lastUsedAt} className="shrink-0" />}
              {arrangementCount > 1 && (
                <span className="inline-flex h-4 shrink-0 items-center leading-4">{arrangementCount} arranjos</span>
              )}
            </span>
          )}

          {/* 3. Primeira linha da letra */}
          {lyricLines.map((line, i) => (
            <span key={i} className="mt-0.5 block truncate text-xs text-muted-foreground">
              <HighlightKeyword text={line} keyword={query} />
            </span>
          ))}
        </span>
        <ChevronRight className="w-5 h-5 shrink-0 text-muted-foreground" aria-hidden="true" />
      </button>
    </li>
  );
}

function ListSkeleton() {
  return (
    <div aria-hidden="true">
      {[55, 70, 45, 62, 50, 68].map((width, i) => (
        <div key={i} className="flex min-h-16 flex-col justify-center gap-1.5 border-b border-border px-4 py-2.5">
          <Skeleton className="h-4" style={{ width: `${width}%` }} />
          <Skeleton className="h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}
