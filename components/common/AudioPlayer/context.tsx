"use client";

import { createContext, useContext, useState } from "react";

export type AudioItem = { url: string; label: string };

type AudioPlayerState = {
  audios: AudioItem[];
  currentIndex: number;
  title?: string;
  isOpen: boolean;
  /** Arranjo cujo áudio está tocando — usado pra realçar o botão de
   * referências certo (vários podem existir na tela ao mesmo tempo). */
  arrangementId: number | null;
};

type AudioPlayerContextType = AudioPlayerState & {
  play: (audios: AudioItem[], title?: string, initialIndex?: number, arrangementId?: number | null) => void;
  switchTo: (index: number) => void;
  close: () => void;
};

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null);

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AudioPlayerState>({
    audios: [],
    currentIndex: 0,
    isOpen: false,
    arrangementId: null,
  });

  const play = (audios: AudioItem[], title?: string, initialIndex = 0, arrangementId: number | null = null) =>
    setState({ audios, currentIndex: initialIndex, title, isOpen: true, arrangementId });

  const switchTo = (index: number) =>
    setState((s) => ({ ...s, currentIndex: index }));

  const close = () => setState((s) => ({ ...s, isOpen: false }));

  return (
    <AudioPlayerContext.Provider value={{ ...state, play, switchTo, close }}>
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) throw new Error("useAudioPlayer must be inside AudioPlayerProvider");
  return ctx;
}
