"use client";

import { useEffect, useRef } from "react";
import { useSWRConfig } from "swr";

export const AUTO_REVALIDATE_INTERVAL_MS = 20_000;
/** Sem nenhum toque, clique, tecla ou roda do mouse por este tempo, a atualização para até a pessoa voltar a usar a tela. */
export const AUTO_REVALIDATE_IDLE_MS = 30 * 60_000;

const ACTIVITY_EVENTS = ["pointerdown", "touchstart", "keydown", "wheel"] as const;

type Options = {
  /** Falso pausa a atualização (ex.: edição com alterações, rolagem automática do Palco). */
  enabled?: boolean;
  intervalMs?: number;
  /** Tempo sem interação a partir do qual para de consultar (evita manter o banco acordado por uma aba esquecida). */
  idleMs?: number;
};

/**
 * Reconsulta, de tempos em tempos, as chaves do SWR que `matches` aceita, para a tela acompanhar o que
 * outra pessoa salvou sem recarregar a página. O SWR já reconsulta ao voltar o foco, mas um celular na
 * estante nunca perde o foco: por isso o intervalo.
 *
 * Só consulta com a aba visível e com rede. O SWR compara o resultado com o anterior: se nada mudou, não
 * re-renderiza. Erro (ex.: rede ou acesso negado) não limpa o que já está na tela. Cada aparelho espera
 * um tempo ligeiramente diferente, para os aparelhos de um culto não baterem no servidor ao mesmo tempo.
 *
 * Para depois de `idleMs` sem interação (aba esquecida aberta manteria o banco serverless acordado). Ao voltar
 * a tocar na tela, consulta na hora e retoma o ritmo normal.
 */
export function useAutoRevalidate(
  matches: (key: unknown) => boolean,
  { enabled = true, intervalMs = AUTO_REVALIDATE_INTERVAL_MS, idleMs = AUTO_REVALIDATE_IDLE_MS }: Options = {}
) {
  const { mutate } = useSWRConfig();
  const matchesRef = useRef(matches);
  matchesRef.current = matches;

  useEffect(() => {
    if (!enabled) return;
    let timer: ReturnType<typeof setTimeout>;
    let lastActivity = Date.now();
    let idle = false;

    function revalidate() {
      const visible = typeof document === "undefined" || document.visibilityState !== "hidden";
      const online = typeof navigator === "undefined" || navigator.onLine !== false;
      if (visible && online) {
        Promise.resolve(mutate((key) => matchesRef.current(key))).catch(() => {});
      }
    }
    function onActivity() {
      lastActivity = Date.now();
      if (idle) {
        idle = false;
        revalidate();
      }
    }
    function onVisibility() {
      if (document.visibilityState === "visible") onActivity();
    }

    function schedule() {
      timer = setTimeout(tick, intervalMs * (0.9 + Math.random() * 0.2));
    }
    function tick() {
      if (Date.now() - lastActivity > idleMs) idle = true;
      if (!idle) revalidate();
      schedule();
    }

    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    document.addEventListener("visibilitychange", onVisibility);
    schedule();
    return () => {
      clearTimeout(timer);
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, onActivity));
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled, intervalMs, idleMs, mutate]);
}
