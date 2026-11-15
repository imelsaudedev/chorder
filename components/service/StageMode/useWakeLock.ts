import { useEffect, useState } from "react";

/**
 * Mantém a tela ligada enquanto o componente está montado, via Screen Wake
 * Lock API nativa. O navegador libera o lock sozinho quando a página some
 * (troca de app/aba), então ele é pedido de novo quando a página volta a
 * ficar visível.
 *
 * `isUnavailable` fica true quando o aparelho não suporta (ou não é HTTPS,
 * ou o navegador negou) — o Modo Palco segue funcionando, só avisa que a
 * tela pode apagar.
 */
export function useWakeLock(): { isUnavailable: boolean } {
  const [isUnavailable, setIsUnavailable] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("wakeLock" in navigator)) {
      setIsUnavailable(true);
      return;
    }

    let sentinel: WakeLockSentinel | null = null;
    let isCancelled = false;

    async function acquire() {
      try {
        const lock = await navigator.wakeLock.request("screen");
        if (isCancelled) {
          lock.release().catch(() => {});
          return;
        }
        sentinel = lock;
        lock.addEventListener("release", () => {
          if (sentinel === lock) sentinel = null;
        });
        setIsUnavailable(false);
      } catch {
        // Negado com a página oculta é esperado (reativa ao voltar); só
        // vira aviso se falhou com a página visível.
        if (!isCancelled && document.visibilityState === "visible") setIsUnavailable(true);
      }
    }

    function onVisibilityChange() {
      if (document.visibilityState === "visible" && !sentinel) acquire();
    }

    acquire();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      isCancelled = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      sentinel?.release().catch(() => {});
      sentinel = null;
    };
  }, []);

  return { isUnavailable };
}
