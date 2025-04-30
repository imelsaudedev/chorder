"use client";

import { useFetchArrangement, useFetchSong } from "@/app/api/api-client";
import { ClientSong, SongArrangementWithUnits } from "@/prisma/models";
import { Mode } from "@components/ModeButtonSet";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";

export type Density = "compact" | "normal";

type ArrangementViewContextType = {
  song: ClientSong | null;
  songSlug: string;
  setSongSlug: Dispatch<SetStateAction<string>>;
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
  songSlug: string;
  arrangementId?: number;
  children: React.ReactNode;
};

export default function ArrangementViewContext({
  songSlug: initialSongSlug,
  arrangementId: initialArrangementId,
  children,
}: ArrangementViewContextProps) {
  const [songSlug, setSongSlug] = useState(initialSongSlug);
  const [arrangementId, setArrangementId] = useState(initialArrangementId);
  const [transpose, setTranspose] = useState(0);
  const [columns, setColumns] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [mode, setMode] = useState("chords" as Mode);
  const [density, setDensity] = useState<Density>("normal");

  const { song } = useFetchSong(songSlug);
  const { arrangement } = useFetchArrangement(songSlug, arrangementId);

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
