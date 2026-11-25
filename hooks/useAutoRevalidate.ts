"use client";

import { useEffect, useRef } from "react";
import { useSWRConfig } from "swr";

export const AUTO_REVALIDATE_INTERVAL_MS = 20_000;

type Options = {
  /** Falso pausa a atualização (ex.: edição com alterações, rolagem automática do Palco). */
  enabled?: boolean;
  intervalMs?: number;
};

/**
 * Reconsulta, de tempos em tempos, as chaves do SWR que `matches` aceita, para a tela acompanhar o que
 * outra pessoa salvou sem recarregar a página. O SWR já reconsulta ao voltar o foco, mas um celular na
 * estante nunca perde o foco: por isso o intervalo.
 *
 * Só consulta com a aba visível e com rede. O SWR compara o resultado com o anterior: se nada mudou, não
 * re-renderiza. Erro (ex.: rede ou acesso negado) não limpa o que já está na tela. Cada aparelho espera
 * um tempo ligeiramente diferente, para os aparelhos de um culto não baterem no servidor ao mesmo tempo.
 */
export function useAutoRevalidate(
  matches: (key: unknown) => boolean,
  { enabled = true, intervalMs = AUTO_REVALIDATE_INTERVAL_MS }: Options = {}
) {
  const { mutate } = useSWRConfig();
  const matchesRef = useRef(matches);
  matchesRef.current = matches;

  useEffect(() => {
    if (!enabled) return;
    let timer: ReturnType<typeof setTimeout>;

    function schedule() {
      timer = setTimeout(tick, intervalMs * (0.9 + Math.random() * 0.2));
    }
    function tick() {
      const visible = typeof document === "undefined" || document.visibilityState !== "hidden";
      const online = typeof navigator === "undefined" || navigator.onLine !== false;
      if (visible && online) {
        Promise.resolve(mutate((key) => matchesRef.current(key))).catch(() => {});
      }
      schedule();
    }

    schedule();
    return () => clearTimeout(timer);
  }, [enabled, intervalMs, mutate]);
}
