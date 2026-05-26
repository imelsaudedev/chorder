"use client";

import { createContext, useContext, useState } from "react";

type AudioPlayerState = {
  url: string | null;
  title?: string;
  isOpen: boolean;
};

type AudioPlayerContextType = AudioPlayerState & {
  play: (url: string, title?: string) => void;
  close: () => void;
};

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null);

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AudioPlayerState>({ url: null, isOpen: false });

  const play = (url: string, title?: string) => setState({ url, title, isOpen: true });
  const close = () => setState((s) => ({ ...s, isOpen: false }));

  return (
    <AudioPlayerContext.Provider value={{ ...state, play, close }}>
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) throw new Error("useAudioPlayer must be inside AudioPlayerProvider");
  return ctx;
}
