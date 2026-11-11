"use client";

import ServicePlanDrawer, { ServicePlanConfig } from "@/components/service/ServicePlanDrawer";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

type NewServiceContextValue = { openNewService: () => void };

const NewServiceContext = createContext<NewServiceContextValue | null>(null);

/** Abre a gaveta de nova liturgia a partir do cabeçalho e do botão flutuante do celular. */
export function useNewService(): NewServiceContextValue {
  const ctx = useContext(NewServiceContext);
  if (!ctx) throw new Error("useNewService precisa estar dentro de NewServiceProvider");
  return ctx;
}

export default function NewServiceProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const openNewService = useCallback(() => setOpen(true), []);
  const value = useMemo(() => ({ openNewService }), [openNewService]);

  function handleSave(config: ServicePlanConfig) {
    const params = new URLSearchParams();
    if (config.title) params.set("title", config.title);
    if (config.worshipLeader) params.set("worshipLeader", config.worshipLeader);
    if (config.preacher) params.set("preacher", config.preacher);
    if (config.templateId) params.set("templateId", String(config.templateId));
    params.set("date", config.date.toISOString());
    setIsNavigating(true);
    setTimeout(() => router.push(`/services/new?${params.toString()}`), 0);
    return false as const;
  }

  return (
    <NewServiceContext.Provider value={value}>
      {children}
      <ServicePlanDrawer open={open} onOpenChange={setOpen} isNew loading={isNavigating} onSave={handleSave} />
    </NewServiceContext.Provider>
  );
}
