"use client";

import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { Density, Mode } from "./config";

type ServiceConfigContextType = {
  columns: number;
  setColumns: Dispatch<SetStateAction<number>>;
  fontSize: number;
  setFontSize: Dispatch<SetStateAction<number>>;
  mode: Mode;
  setMode: Dispatch<SetStateAction<Mode>>;
  density: Density;
  setDensity: Dispatch<SetStateAction<Density>>;
};

const ServiceConfigContext = createContext<ServiceConfigContextType | null>(
  null
);

type ServiceConfigContextProps = {
  children: React.ReactNode;
};
export default function ServiceConfigProvider({
  children,
}: ServiceConfigContextProps) {
  const [columns, setColumns] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [mode, setMode] = useState("chords" as Mode);
  const [density, setDensity] = useState<"compact" | "normal">("normal");

  return (
    <ServiceConfigContext.Provider
      value={{
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
    </ServiceConfigContext.Provider>
  );
}

export function useServiceConfig() {
  const context = useContext(ServiceConfigContext);
  if (!context) {
    throw new Error(
      "useServiceConfig must be used within a ServiceConfigProvider"
    );
  }
  return context;
}
