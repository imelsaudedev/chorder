import { RefObject, useEffect, useRef } from "react";

// Escala de velocidade como múltiplos (igual player de áudio/vídeo), só com
// velocidades lentas — com 1x = 25px/s, uma cifra longa de ~4000px leva ~2,5min.
// Calibração inicial — ajustável livremente, sem precisar de nova aprovação.
// 0.15x adicionado para músicas lentas, em que 0.25x (6,25px/s) ainda
// corria rápido demais.
export const SCROLL_SPEED_MULTIPLIERS = [0.15, 0.25, 0.5, 0.75, 1] as const;
export const DEFAULT_SCROLL_SPEED_MULTIPLIER: number = SCROLL_SPEED_MULTIPLIERS[2];

// Pixels por segundo na velocidade "1x" — base da escala de múltiplos.
const BASE_SCROLL_SPEED_PX_PER_SECOND = 25;

// Depois de uma rolagem manual (dedo, roda do mouse), espera esse tempo sem
// novos movimentos antes de retomar — inclui a inércia do iOS.
const MANUAL_SCROLL_GRACE_MS = 250;

export function multiplierToPxPerSecond(multiplier: number): number {
  return multiplier * BASE_SCROLL_SPEED_PX_PER_SECOND;
}

export function formatScrollSpeedMultiplier(multiplier: number): string {
  return `${multiplier}x`;
}

/**
 * Próxima velocidade da escala no sentido pedido (+1 mais rápido, -1 mais
 * devagar), presa nos extremos. Um valor fora da escala (ex. salvo por uma
 * versão anterior) é tratado como a velocidade padrão.
 */
export function stepScrollSpeed(current: number, direction: 1 | -1): number {
  const scale: readonly number[] = SCROLL_SPEED_MULTIPLIERS;
  let index = scale.indexOf(current);
  if (index === -1) index = scale.indexOf(DEFAULT_SCROLL_SPEED_MULTIPLIER);
  const next = Math.min(scale.length - 1, Math.max(0, index + direction));
  return scale[next];
}

/**
 * Índice da música em que `scrollTop` está, dado o início (em scrollTop) de
 * cada música em ordem. Tolera 1px de arredondamento — parar exatamente no
 * início de uma música já conta como estar nela.
 */
export function findSongIndex(songStarts: number[], scrollTop: number): number {
  let index = 0;
  songStarts.forEach((start, i) => {
    if (start <= scrollTop + 1) index = i;
  });
  return index;
}

/**
 * Onde a rolagem automática deve parar a partir de `scrollTop`: no início da
 * próxima música (pausa entre músicas) ou no fim do conteúdo.
 */
export function nextStopPosition(songStarts: number[], scrollTop: number, maxScrollTop: number): number {
  const next = songStarts[findSongIndex(songStarts, scrollTop) + 1];
  return Math.min(next ?? maxScrollTop, maxScrollTop);
}

/**
 * Converte um intervalo de tempo (dt, em ms) e uma velocidade (px/s) em
 * quantos pixels inteiros rolar agora, carregando a fração pro próximo
 * quadro. Sem isso, velocidades baixas (poucos px/s) arredondam pra zero
 * em todo frame e a rolagem trava — o "carry" acumula o resto até dar 1px.
 */
export function computeScrollStep(
  pxPerSecond: number,
  dtMs: number,
  carry: number
): { pixels: number; carry: number } {
  const total = carry + (pxPerSecond * dtMs) / 1000;
  const pixels = Math.floor(total);
  return { pixels, carry: total - pixels };
}

type UseAutoScrollOptions = {
  containerRef: RefObject<HTMLElement | null>;
  isEnabled: boolean;
  speedPxPerSecond: number;
  /** Posição (scrollTop) onde parar, a partir da atual. Padrão: fim do conteúdo. */
  getStopPosition?: (scrollTop: number) => number;
  onReachEnd: () => void;
};

/**
 * Rola `containerRef` automaticamente enquanto `isEnabled` for true, via
 * requestAnimationFrame. Para sozinho ao chegar em `getStopPosition`
 * (chamando `onReachEnd`, que deve desligar `isEnabled`). Mudar a
 * velocidade não reinicia o loop — é lida via ref a cada frame.
 *
 * Rolagem manual não desliga: enquanto o dedo está na tela, ou logo depois
 * de um movimento que não foi nosso, o loop só espera — e retoma dali, pro
 * músico poder voltar ao refrão sem tocar no play de novo.
 */
export function useAutoScroll({
  containerRef,
  isEnabled,
  speedPxPerSecond,
  getStopPosition,
  onReachEnd,
}: UseAutoScrollOptions) {
  const speedRef = useRef(speedPxPerSecond);
  speedRef.current = speedPxPerSecond;

  const getStopPositionRef = useRef(getStopPosition);
  getStopPositionRef.current = getStopPosition;

  const onReachEndRef = useRef(onReachEnd);
  onReachEndRef.current = onReachEnd;

  useEffect(() => {
    const container = containerRef.current;
    if (!isEnabled || !container) return;

    let rafId: number;
    let lastTime: number | null = null;
    let carry = 0;
    let isTouching = false;
    let lastManualScroll = -Infinity;
    // Último scrollTop que nós mesmos aplicamos — qualquer evento de scroll
    // fora dele é rolagem manual.
    let expectedTop = container.scrollTop;

    const onTouchStart = () => {
      isTouching = true;
    };
    const onTouchEnd = () => {
      isTouching = false;
      lastManualScroll = performance.now();
    };
    const onScroll = () => {
      if (Math.abs(container.scrollTop - expectedTop) > 1) {
        lastManualScroll = performance.now();
        expectedTop = container.scrollTop;
      }
    };
    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchend", onTouchEnd, { passive: true });
    container.addEventListener("touchcancel", onTouchEnd, { passive: true });
    container.addEventListener("scroll", onScroll, { passive: true });

    function tick(time: number) {
      const el = containerRef.current;
      if (!el) return;
      const dt = lastTime === null ? 0 : time - lastTime;
      lastTime = time;

      if (isTouching || time - lastManualScroll < MANUAL_SCROLL_GRACE_MS) {
        carry = 0;
        rafId = requestAnimationFrame(tick);
        return;
      }

      const maxScrollTop = el.scrollHeight - el.clientHeight;
      const stopAt = Math.min(getStopPositionRef.current?.(el.scrollTop) ?? maxScrollTop, maxScrollTop);

      const step = computeScrollStep(speedRef.current, dt, carry);
      carry = step.carry;
      if (step.pixels > 0) {
        el.scrollTop = Math.min(el.scrollTop + step.pixels, stopAt);
        expectedTop = el.scrollTop;
      }

      if (el.scrollTop >= stopAt - 1) {
        onReachEndRef.current();
        return;
      }

      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchend", onTouchEnd);
      container.removeEventListener("touchcancel", onTouchEnd);
      container.removeEventListener("scroll", onScroll);
    };
  }, [isEnabled, containerRef]);
}
