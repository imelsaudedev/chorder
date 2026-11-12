"use client";

import {
  ServicesListState,
  applyServicesListState,
  parseServicesListState,
} from "@/lib/services-list-state";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

/**
 * Estado do histórico de Liturgias (busca, filtros, ordenação, agrupamento) guardado na URL.
 * Mudar o estado troca a URL sem empilhar histórico e sem rolar a página.
 */
export default function useServicesListState() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const paramsKey = searchParams.toString();
  const state = useMemo(() => parseServicesListState(new URLSearchParams(paramsKey)), [paramsKey]);

  const update = useCallback(
    (patch: Partial<ServicesListState>) => {
      const next = applyServicesListState(new URLSearchParams(paramsKey), patch).toString();
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    },
    [paramsKey, pathname, router]
  );

  const clearFilters = useCallback(
    () => update({ query: "", year: null, leaders: [], preachers: [] }),
    [update]
  );

  return { state, update, clearFilters };
}
