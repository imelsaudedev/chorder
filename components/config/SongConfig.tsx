"use client";

import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { Density, Mode } from "./config";

type SongConfigContextType = {
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

export const SongConfigContext = createContext<SongConfigContextType | null>(
  null
);

type SongConfigContextProps = {
  transpose?: number | null;
  columns?: number | null;
  fontSize?: number | null;
  mode?: Mode | null;
  density?: Density | null;
  children: React.ReactNode;
};

export default function SongConfigProvider({
  transpose: initialTranspose,
  columns: initialColumns,
  fontSize: initialFontSize,
  mode: initialMode,
  density: initialDensity,
  children,
}: SongConfigContextProps) {
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

  return (
    <SongConfigContext.Provider
      value={{
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
    </SongConfigContext.Provider>
  );
}

export function useSongConfig() {
  const context = useContext(SongConfigContext);
  if (!context) {
    throw new Error("useSongConfig must be used within a SongConfigProvider");
  }
  return context;
}
