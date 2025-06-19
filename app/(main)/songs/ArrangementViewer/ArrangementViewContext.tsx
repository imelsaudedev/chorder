"use client";

import { useFetchArrangement } from "@/app/api/api-client";
import { ClientSong, SongArrangementWithUnits } from "@/prisma/models";
import { Mode } from "@components/ModeButtonSet";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";

export type Density = "compact" | "normal";

type ArrangementViewContextType = {
  song: ClientSong | null | undefined;
  songSlug: string | undefined;
  setSongSlug: Dispatch<SetStateAction<string | undefined>>;
  arrangement: SongArrangementWithUnits | null;
  arrangementId: number | undefined;
  setArrangementId: Dispatch<SetStateAction<number | undefined>>;
  transpose: number;
  setTranspose: Dispatch<SetStateAction<number>>;
  columns: number;
  setColumns: Dispatch<SetStateAction<number>>;
  fontSize: number;
  setFontSize: Dispatch<SetStateAction<number>>;
  mode: Mode;
  setMode: Dispatch<SetStateAction<Mode>>;
  density: Density;
  setDensity: Dispatch<SetStateAction<Density>>;
};

const Ctx = createContext<ArrangementViewContextType | null>(null);

type ArrangementViewContextProps = {
  songSlug?: string;
  arrangementId?: number;
  transpose?: number | null;
  columns?: number | null;
  fontSize?: number | null;
  mode?: Mode | null;
  density?: Density | null;
  children: React.ReactNode;
};

export default function ArrangementViewContext({
  songSlug: initialSongSlug,
  arrangementId: initialArrangementId,
  transpose: initialTranspose,
  columns: initialColumns,
  fontSize: initialFontSize,
  mode: initialMode,
  density: initialDensity,
  children,
}: ArrangementViewContextProps) {
  const [songSlug, setSongSlug] = useState(initialSongSlug);
  const [arrangementId, setArrangementId] = useState(initialArrangementId);
  const [transpose, setTranspose] = useState(initialTranspose ?? 0);
  const [columns, setColumns] = useState(initialColumns ?? 0);
  const [fontSize, setFontSize] = useState(initialFontSize ?? 16);
  const [mode, setMode] = useState(initialMode ?? ("chords" as Mode));
  const [density, setDensity] = useState<Density>(initialDensity ?? "normal");

  useEffect(() => {
    setColumns((prev) => initialColumns ?? prev);
  }, [initialColumns]);
  useEffect(() => {
    setFontSize((prev) => initialFontSize ?? prev);
  }, [initialFontSize]);
  useEffect(() => {
    setMode((prev) => initialMode ?? prev);
  }, [initialMode]);
  useEffect(() => {
    setDensity((prev) => initialDensity ?? prev);
  }, [initialDensity]);

  const { arrangement } = useFetchArrangement(songSlug, arrangementId);
  if (arrangement && arrangement.id !== arrangementId) {
    setArrangementId(arrangement.id);
  }
  const song = arrangement?.song;
  if (song && song.slug !== songSlug) {
    setSongSlug(song.slug);
  }

  return (
    <Ctx.Provider
      value={{
        song,
        songSlug,
        setSongSlug,
        arrangement,
        arrangementId,
        setArrangementId,
        transpose,
        setTranspose,
        columns,
        setColumns,
        fontSize,
        setFontSize,
        mode,
        setMode,
        density,
        setDensity,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useSong() {
  return {
    song: useContext(Ctx)!.song,
    songSlug: useContext(Ctx)!.songSlug,
    setSongSlug: useContext(Ctx)!.setSongSlug,
  };
}

export function useArrangement() {
  return {
    arrangement: useContext(Ctx)!.arrangement,
    arrangementId: useContext(Ctx)!.arrangementId,
    setArrangementId: useContext(Ctx)!.setArrangementId,
  };
}

export function useTranspose() {
  return {
    transpose: useContext(Ctx)!.transpose,
    setTranspose: useContext(Ctx)!.setTranspose,
  };
}

export function useColumns() {
  return {
    columns: useContext(Ctx)!.columns,
    setColumns: useContext(Ctx)!.setColumns,
  };
}

export function useFontSize() {
  return {
    fontSize: useContext(Ctx)!.fontSize,
    setFontSize: useContext(Ctx)!.setFontSize,
  };
}

export function useMode() {
  return { mode: useContext(Ctx)!.mode, setMode: useContext(Ctx)!.setMode };
}

export function useDensity() {
  return {
    density: useContext(Ctx)!.density,
    setDensity: useContext(Ctx)!.setDensity,
  };
}
