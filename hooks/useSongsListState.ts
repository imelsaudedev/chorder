"use client";

import { SongsListState, applySongsListState, parseSongsListState } from "@/lib/songs-list-state";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

/**
 * Estado da lista de Músicas (busca, categorias, ordenação) guardado na URL.
 * Mudar o estado troca a URL sem empilhar histórico e sem rolar a página.
 */
export default function useSongsListState() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const paramsKey = searchParams.toString();
  const state = useMemo(() => parseSongsListState(new URLSearchParams(paramsKey)), [paramsKey]);

  const update = useCallback(
    (patch: Partial<SongsListState>) => {
      const next = applySongsListState(new URLSearchParams(paramsKey), patch).toString();
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    },
    [paramsKey, pathname, router]
  );

  return {
    ...state,
    setQuery: (query: string) => update({ query }),
    setTagIds: (tagIds: number[]) => update({ tagIds }),
    setSort: (sort: SongsListState["sort"]) => update({ sort }),
  };
}
