"use client";

import { createContext, useContext, useState } from "react";

type YoutubePlayerState = {
  url: string | null;
  title?: string;
  isOpen: boolean;
};

type YoutubePlayerContextType = YoutubePlayerState & {
  play: (url: string, title?: string) => void;
  close: () => void;
};

const YoutubePlayerContext = createContext<YoutubePlayerContextType | null>(null);

export function YoutubePlayerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<YoutubePlayerState>({ url: null, isOpen: false });

  const play = (url: string, title?: string) => setState({ url, title, isOpen: true });
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
