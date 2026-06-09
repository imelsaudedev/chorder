"use client";

import { createContext, useContext, useState } from "react";

export type AudioItem = { url: string; label: string };

type AudioPlayerState = {
  audios: AudioItem[];
  currentIndex: number;
  title?: string;
  isOpen: boolean;
};

type AudioPlayerContextType = AudioPlayerState & {
  play: (audios: AudioItem[], title?: string) => void;
  switchTo: (index: number) => void;
  close: () => void;
};

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null);

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AudioPlayerState>({
    audios: [],
    currentIndex: 0,
    isOpen: false,
  });

  const play = (audios: AudioItem[], title?: string) =>
    setState({ audios, currentIndex: 0, title, isOpen: true });

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
