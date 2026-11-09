"use client";

import { SongSort } from "@/lib/songs-list-state";
import { DESKTOP_QUERY, JUMP_EVENT, STICKY_TOP_VAR } from "@/lib/songs-list-sticky";
import { ClientTagGroup } from "@/prisma/models";
import CategoryPicker from "./CategoryPicker";
import ExpandingSearch from "./ExpandingSearch";
import LettersGrid from "./LettersGrid";
import SortMenu from "./SortMenu";
import { useEffect, useRef, useState } from "react";

type SongsFilterBarProps = {
  tagGroups: ClientTagGroup[];
  selectedTagIds: number[];
  onTagsChange: (tagIds: number[]) => void;
  query: string;
  onQueryChange: (query: string) => void;
  sort: SongSort;
  onSortChange: (sort: SongSort) => void;
  /** Página de uma categoria: a busca diz "Buscar em <categoria>". */
  scopeLabel?: string;
};

/**
 * Bloco de filtros da lista de Músicas. Desktop: uma linha (seletores à esquerda; lupa,
 * letras e ordenação à direita). Celular: duas linhas — categorias com rolagem lateral
 * e, embaixo, lupa, letras e ordenação.
 */
/**
 * Barra fixa no topo. No celular some ao descer e volta ao subir (a faixa da letra
 * continua); no desktop fica sempre. Publica a altura visível em --songs-sticky-top,
 * que a faixa da letra usa como `top`.
 */
function useStickyBar() {
  const ref = useRef<HTMLDivElement>(null);
  // Marca a posição natural da barra: "grudada" = essa marca já passou do topo. Sem isso,
  // na home (barra no meio da página) ela esconderia antes de grudar e invadiria o conteúdo de cima.
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    let ignoreUntil = 0;
    const desktop = () => window.matchMedia(DESKTOP_QUERY).matches;

    function onScroll() {
      const y = window.scrollY;
      const d = y - last;
      last = y;
      const isStuck = (sentinelRef.current?.getBoundingClientRect().top ?? 1) <= 0;
      setStuck(isStuck);
      if (desktop() || !isStuck) return setHidden(false);
      if (performance.now() < ignoreUntil) return;
      if (d > 6) setHidden(true);
      else if (d < -6) setHidden(false);
    }
    // Pulo de letra: a faixa deve ficar no topo, com a barra escondida.
    function onJump() {
      if (desktop()) return;
      ignoreUntil = performance.now() + 400;
      setHidden(true);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener(JUMP_EVENT, onJump);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener(JUMP_EVENT, onJump);
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = document.documentElement;
    const publish = () => root.style.setProperty(STICKY_TOP_VAR, hidden ? "0px" : `${el.offsetHeight}px`);
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    return () => ro.disconnect();
  }, [hidden]);

  useEffect(
    () => () => {
      document.documentElement.style.removeProperty(STICKY_TOP_VAR);
    },
    []
  );

  return { ref, sentinelRef, hidden, stuck };
}

export default function SongsFilterBar({
  tagGroups,
  selectedTagIds,
  onTagsChange,
  query,
  onQueryChange,
  sort,
  onSortChange,
  scopeLabel,
}: SongsFilterBarProps) {
  const { ref, sentinelRef, hidden, stuck } = useStickyBar();
  const selectedGroupName = tagGroups.find((g) => g.tags.some((t) => selectedTagIds.includes(t.id)))?.name;
  const placeholder = scopeLabel
    ? `Buscar em ${scopeLabel}`
    : selectedGroupName
    ? `Buscar em ${
        tagGroups
          .flatMap((g) => g.tags)
          .filter((t) => selectedTagIds.includes(t.id))
          .map((t) => t.name)
          .join(", ")
      }`
    : "Buscar músicas";

  const pickers = tagGroups.map((group) => (
    <CategoryPicker key={group.id} group={group} selectedTagIds={selectedTagIds} onChange={onTagsChange} />
  ));

  const tools = (
    <>
      <ExpandingSearch value={query} placeholder={placeholder} onSearch={onQueryChange} />
      {sort.key === "title" && <LettersGrid />}
      <SortMenu sort={sort} onChange={onSortChange} />
    </>
  );

  return (
    <>
    <div ref={sentinelRef} aria-hidden className="h-0" />
    <div
      ref={ref}
      data-songs-filter-bar
      className={`sticky top-0 z-30 -mx-5 mb-6 flex flex-col gap-2 bg-background px-5 py-2 transition-[transform,box-shadow] duration-200 sm:-mx-8 sm:flex-row sm:items-center sm:gap-2 sm:px-8 lg:-mx-14 lg:px-14 ${
        hidden ? "max-sm:-translate-y-full" : ""
      } ${stuck && !hidden ? "shadow-[0_1px_0_var(--border),0_4px_8px_-4px_rgba(0,0,0,.12)]" : ""}`}
    >
      <div className="flex gap-2 overflow-x-auto no-scrollbar sm:flex-1 sm:flex-wrap sm:overflow-visible">
        {pickers}
      </div>
      <div className="flex items-center gap-2 sm:ml-auto sm:justify-end">{tools}</div>
    </div>
    </>
  );
}
