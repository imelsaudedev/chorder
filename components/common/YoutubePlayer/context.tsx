"use client";

import { createContext, useContext, useState } from "react";

type YoutubePlayerState = {
  url: string | null;
  title?: string;
  isOpen: boolean;
  /** Arranjo cujo vídeo está tocando — usado pra realçar o botão de
   * referências certo (vários podem existir na tela ao mesmo tempo). */
  arrangementId: number | null;
};

type YoutubePlayerContextType = YoutubePlayerState & {
  play: (url: string, title?: string, arrangementId?: number | null) => void;
  close: () => void;
};

const YoutubePlayerContext = createContext<YoutubePlayerContextType | null>(null);

export function YoutubePlayerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<YoutubePlayerState>({ url: null, isOpen: false, arrangementId: null });

  const play = (url: string, title?: string, arrangementId: number | null = null) =>
    setState({ url, title, isOpen: true, arrangementId });
  const close = () => setState((s) => ({ ...s, isOpen: false }));

  return (
    <YoutubePlayerContext.Provider value={{ ...state, play, close }}>
      {children}
    </YoutubePlayerContext.Provider>
  );
}

export function useYoutubePlayer() {
  const ctx = useContext(YoutubePlayerContext);
  if (!ctx) throw new Error("useYoutubePlayer must be inside YoutubePlayerProvider");
  return ctx;
}
