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
  const [columns, setColumns, setUntouchedColumns, columnsTouched] =
    useTouchedState(initialColumns ?? 0);
  const [fontSize, setFontSize, setUntouchedFontSize, fontSizeTouched] =
    useTouchedState(initialFontSize ?? 16);
  const [mode, setMode, setUntouchedMode, modeTouched] = useTouchedState(
    initialMode ?? ("chords" as Mode)
  );
  const [density, setDensity, setUntouchedDensity, densityTouched] =
    useTouchedState<Density>(initialDensity ?? "normal");

  useEffect(() => {
    setTranspose(initialTranspose ?? 0);
  }, [initialTranspose]);
  useEffect(() => {
    if (!columnsTouched) {
      setUntouchedColumns((prev) => initialColumns ?? prev);
    }
  }, [initialColumns, columnsTouched, setUntouchedColumns]);
  useEffect(() => {
    if (!fontSizeTouched) {
      setUntouchedFontSize((prev) => initialFontSize ?? prev);
    }
  }, [initialFontSize, fontSizeTouched, setUntouchedFontSize]);
  useEffect(() => {
    if (!modeTouched) {
      setUntouchedMode((prev) => initialMode ?? prev);
    }
  }, [initialMode, modeTouched, setUntouchedMode]);
  useEffect(() => {
    if (!densityTouched) {
      setUntouchedDensity((prev) => initialDensity ?? prev);
    }
  }, [initialDensity, densityTouched, setUntouchedDensity]);

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

function useTouchedState<T>(
  initialValue: T
): [T, Dispatch<SetStateAction<T>>, Dispatch<SetStateAction<T>>, boolean] {
  const [value, setValue] = useState(initialValue);
  const [touched, setTouched] = useState(false);

  const setTouchedValue: Dispatch<SetStateAction<T>> = (newValue) => {
    setTouched(true);
    setValue(newValue);
  };

  return [value, setTouchedValue, setValue, touched];
}
