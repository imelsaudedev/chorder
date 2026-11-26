"use client";

import { useViewer } from "@/components/auth/ViewerProvider";
import { DEFAULT_SORT, SongsListState, applySongsListState, parseSongsListState } from "@/lib/songs-list-state";
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
  const { canSeeUsageStats } = useViewer();

  const paramsKey = searchParams.toString();
  const state = useMemo(() => {
    const parsed = parseSongsListState(new URLSearchParams(paramsKey));
    // Endereço antigo ou compartilhado com ordenação por uso: quem não vê o uso cai no padrão.
    return !canSeeUsageStats && parsed.sort.key === "usage" ? { ...parsed, sort: DEFAULT_SORT } : parsed;
  }, [paramsKey, canSeeUsageStats]);

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
