"use client";

import { useEffect, useRef } from "react";

export type StageKeyboardHandlers = {
  layout: "scroll" | "overview";
  /** Troca de música (na visão geral, de tela): -1 anterior, 1 próxima. */
  onSong: (delta: -1 | 1) => void;
  /** Velocidade da rolagem automática (só no layout de rolagem): -1 mais devagar, 1 mais rápida. */
  onSpeed: (direction: -1 | 1) => void;
};

/** Teclas dentro destes elementos são deles (campos, janelas, menus), não atalhos do Palco. */
const IGNORED_TARGETS = 'input, textarea, select, [contenteditable="true"], [role="dialog"], [data-radix-popper-content-wrapper]';

/**
 * Atalhos de teclado do Palco (teclado, e pedal Bluetooth, que manda essas teclas):
 * - ↑ / ↓: música anterior / próxima (na rolagem salta para o início dela; na visão geral troca de tela);
 * - ← / →: rolagem automática mais devagar / mais rápida; na visão geral não há velocidade, então
 *   continuam trocando de tela, como antes;
 * - PageUp / PageDown: trocam de tela na visão geral; na rolagem seguem o comportamento do navegador.
 */
export function useStageKeyboard(handlers: StageKeyboardHandlers) {
  const ref = useRef(handlers);
  ref.current = handlers;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest?.(IGNORED_TARGETS)) return;
      const { layout, onSong, onSpeed } = ref.current;

      let handled = true;
      switch (event.key) {
        case "ArrowDown":
          onSong(1);
          break;
        case "ArrowUp":
          onSong(-1);
          break;
        case "ArrowRight":
          if (layout === "overview") onSong(1);
          else onSpeed(1);
          break;
        case "ArrowLeft":
          if (layout === "overview") onSong(-1);
          else onSpeed(-1);
          break;
        case "PageDown":
          if (layout === "overview") onSong(1);
          else handled = false;
          break;
        case "PageUp":
          if (layout === "overview") onSong(-1);
          else handled = false;
          break;
        default:
          handled = false;
      }
      if (handled) event.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
