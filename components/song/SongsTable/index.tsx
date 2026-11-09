"use client";

import SongListEntry from "@/components/song/SongListEntry";
import {
  clearSongsListMemory,
  readSongsListMemory,
  saveSongsListMemory,
  songSlugFromHref,
} from "@/lib/songs-list-memory";
import { SongSort, initialOf, sortSongs } from "@/lib/songs-list-state";
import { ClientSong } from "@/prisma/models";
import { useTranslations } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";
import { Fragment, useEffect, useMemo, useRef } from "react";

// Respiro lateral do cartão: o mesmo do item (SongRow flush), para as colunas alinharem.
const PAD = "px-4 @[560px]:px-5 @[860px]:px-6";

/** Cabeçalho de colunas: acompanha as colunas do item em cada largura da lista. */
function ColumnHeader({ count }: { count: number }) {
  return (
    <div
      className={`grid items-center gap-x-4 bg-zinc-50 py-3 text-sm font-medium text-muted-foreground ${PAD} grid-cols-[minmax(0,1fr)] @[560px]:gap-x-5 @[560px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_3.5rem_2.5rem] @[860px]:grid-cols-[minmax(0,2.3fr)_minmax(0,2.4fr)_minmax(0,1.6fr)_11rem_3.5rem_2.5rem]`}
    >
      <span>
        {count} música{count === 1 ? "" : "s"}
      </span>
      <span className="hidden @[560px]:block @[860px]:hidden">Letra e categorias</span>
      <span className="hidden @[860px]:block">Letra</span>
      <span className="hidden @[860px]:block">Categorias</span>
      <span className="hidden @[860px]:block">Último uso</span>
      <span className="hidden @[560px]:block" aria-hidden />
      <span className="hidden @[560px]:block" aria-hidden />
    </div>
  );
}

/** Faixa contínua de ponta a ponta com a letra do grupo (só na ordem por título). */
function LetterBand({ letter }: { letter: string }) {
  return (
    <div
      id={letter}
      data-letter-band
      className={`flex h-8 items-center bg-zinc-50 text-sm font-semibold uppercase text-secondary scroll-mt-4 ${PAD}`}
    >
      {letter.toUpperCase()}
    </div>
  );
}

type SongsTableProps = {
  songs: ClientSong[];
  sort: SongSort;
  query?: string;
};

/**
 * Lista de Músicas em cartão: cabeçalho de colunas, faixas de letra (ordenação por
 * título) e os itens. Lembra de onde a pessoa saiu ao abrir uma música, para o Voltar
 * retomar a lista (endereço com filtros + posição da rolagem).
 */
export default function SongsTable({ songs, sort, query = "" }: SongsTableProps) {
  const t = useTranslations("SongForm");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentUrl = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname;

  const sorted = useMemo(() => sortSongs(songs, sort), [songs, sort]);
  const withBands = sort.key === "title";

  const initials = useMemo(() => {
    if (!withBands) return [];
    return Array.from(new Set(sorted.map((s) => initialOf(s.title))));
  }, [sorted, withBands]);

  // Volta à posição de rolagem de onde a pessoa saiu (uma vez).
  const restored = useRef(false);
  useEffect(() => {
    if (restored.current || sorted.length === 0) return;
    restored.current = true;
    const memory = readSongsListMemory();
    if (!memory || memory.url !== currentUrl) return;
    clearSongsListMemory();
    requestAnimationFrame(() => window.scrollTo({ top: memory.scrollY }));
  }, [sorted.length, currentUrl]);

  // Ao abrir uma música, guarda de onde saiu.
  function rememberOnOpen(e: React.MouseEvent<HTMLElement>) {
    const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="/songs/"]');
    const slug = link ? songSlugFromHref(link.getAttribute("href") ?? "") : null;
    if (slug) saveSongsListMemory({ url: currentUrl, scrollY: window.scrollY, slug });
  }

  if (sorted.length === 0) {
    return <p className="py-8 text-center text-muted-foreground">{t("noSongs")}</p>;
  }

  let lastInitial: string | null = null;
  return (
    <>
      <section
        className="@container overflow-hidden rounded-xl border bg-background shadow-xs max-sm:-mx-5 max-sm:rounded-none max-sm:border-x-0"
        onClickCapture={rememberOnOpen}
      >
        <div className="divide-y divide-border">
          <ColumnHeader count={sorted.length} />
          {sorted.map((song) => {
            const initial = withBands ? initialOf(song.title) : null;
            const band = initial !== null && initial !== lastInitial ? <LetterBand letter={initial} /> : null;
            lastInitial = initial;
            return (
              <Fragment key={`song-${song.slug}`}>
                {band}
                <SongListEntry song={song} query={query} flush />
              </Fragment>
            );
          })}
        </div>
      </section>
    </>
  );
}
