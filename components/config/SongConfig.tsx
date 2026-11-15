"use client";

import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Density, Mode } from "./config";

type SongConfigContextType = {
  transpose: number;
  setTranspose: Dispatch<SetStateAction<number>>;
  enharmonicPreference: "sharp" | "flat" | null;
  setEnharmonicPreference: Dispatch<SetStateAction<"sharp" | "flat" | null>>;
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
  /** Avisa quem chamou quando o tom muda, para elevar o estado além do
   * tempo de vida deste provider (ex.: o Modo Palco precisa continuar de
   * onde o modo normal parou, e vice-versa). */
  onTransposeChange?: (value: number) => void;
  columns?: number | null;
  fontSize?: number | null;
  mode?: Mode | null;
  density?: Density | null;
  children: React.ReactNode;
};

export default function SongConfigProvider({
  transpose: initialTranspose,
  onTransposeChange,
  columns: initialColumns,
  fontSize: initialFontSize,
  mode: initialMode,
  density: initialDensity,
  children,
}: SongConfigContextProps) {
  const [transpose, setTranspose] = useState(initialTranspose ?? 0);

  // Avisa quem elevou o estado depois da renderização (nunca dentro do
  // updater do setState — chamar o callback do pai ali violava as regras
  // do React: "Cannot update a component while rendering a different
  // component", reproduzido ao trocar o tom na liturgia).
  const onTransposeChangeRef = useRef(onTransposeChange);
  onTransposeChangeRef.current = onTransposeChange;
  useEffect(() => {
    onTransposeChangeRef.current?.(transpose);
  }, [transpose]);
  const [enharmonicPreference, setEnharmonicPreference] = useState<"sharp" | "flat" | null>(null);
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
    // Só re-sincroniza com o valor que o próprio chamador já tem; dispara
    // de novo o efeito de onTransposeChange acima, mas com o mesmo valor
    // que ele já possui, então é inofensivo.
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
        enharmonicPreference,
        setEnharmonicPreference,
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
