"use client";

import { ServiceWithUnits } from "@/prisma/models";
import { Mode } from "@/app-old/lib/components/ModeButtonSet";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";
import useSWR from "swr";

type Density = "compact" | "normal";

type ServiceViewContextType = {
  serviceSlug: string;
  setServiceSlug: Dispatch<SetStateAction<string>>;
  service: ServiceWithUnits | null;
  columns: number;
  setColumns: Dispatch<SetStateAction<number>>;
  fontSize: number;
  setFontSize: Dispatch<SetStateAction<number>>;
  mode: Mode;
  setMode: Dispatch<SetStateAction<Mode>>;
  density: Density;
  setDensity: Dispatch<SetStateAction<Density>>;
};

const Ctx = createContext<ServiceViewContextType | null>(null);

type ServiceViewContextProps = {
  serviceSlug: string;
  children: React.ReactNode;
};

export default function ServiceViewContext({
  serviceSlug: initialServiceSlug,
  children,
}: ServiceViewContextProps) {
  const [serviceSlug, setServiceSlug] = useState(initialServiceSlug);
  const { service } = useFetchService(serviceSlug);
  const [columns, setColumns] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [mode, setMode] = useState("chords" as Mode);
  const [density, setDensity] = useState<"compact" | "normal">("normal");

  return (
    <Ctx.Provider
      value={{
        serviceSlug,
        setServiceSlug,
        service,
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

export function useService() {
  const context = useContext(Ctx);
  return {
    service: context!.service,
    serviceSlug: context!.serviceSlug,
    setServiceSlug: context!.setServiceSlug,
  };
}

export function useColumns() {
  const context = useContext(Ctx);
  return {
    columns: context!.columns,
    setColumns: context!.setColumns,
  };
}

export function useFontSize() {
  const context = useContext(Ctx);
  return {
    fontSize: context!.fontSize,
    setFontSize: context!.setFontSize,
  };
}

export function useMode() {
  const context = useContext(Ctx);
  return {
    mode: context!.mode,
    setMode: context!.setMode,
  };
}

export function useDensity() {
  const context = useContext(Ctx);
  return {
    density: context!.density,
    setDensity: context!.setDensity,
  };
}

function useFetchService(slug: string) {
  const { data, error, isLoading } = useSWR(
    `/api/services/${slug}`,
    (...args) => fetch(...args).then((res) => res.json())
  );
  return {
    service: data as ServiceWithUnits | null,
    isLoading,
    isError: error,
  };
}
