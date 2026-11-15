import { useEffect, useRef } from "react";

const STAGE_MODE_STATE_KEY = "stageMode";

/**
 * Ao entrar no Modo Palco, empilha uma entrada no histórico (mesma URL) pro
 * botão voltar do aparelho sair do modo antes de sair da página. O Next
 * preserva seu estado interno em `pushState`, então é seguro.
 */
export function pushStageModeEntry() {
  window.history.pushState({ [STAGE_MODE_STATE_KEY]: true }, "");
}

function isStageModeEntry() {
  return window.history.state?.[STAGE_MODE_STATE_KEY] === true;
}

/**
 * Sai do Modo Palco consumindo a entrada de histórico (a saída de fato
 * acontece no `popstate`, para botão voltar e botão de sair seguirem o mesmo
 * caminho). Se a entrada não existe — ex. a página foi recarregada dentro do
 * modo —, sai direto.
 */
export function requestStageModeExit(exitNow: () => void) {
  if (isStageModeEntry()) {
    window.history.back();
  } else {
    exitNow();
  }
}

/** Chama `onBack` quando o usuário volta da entrada do Modo Palco. */
export function useStageModeBack(onBack: () => void) {
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;

  useEffect(() => {
    const onPopState = () => {
      if (!isStageModeEntry()) onBackRef.current();
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
}
