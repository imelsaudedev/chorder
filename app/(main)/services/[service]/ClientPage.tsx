"use client";

import { useFetchService } from "#api-client";
import Main from "@/components/common/Main";
import ServiceConfigProvider, {
  useServiceConfig,
} from "@/components/config/ServiceConfig";
import ServiceHeader from "@/components/service/ServiceHeader";
import ServiceLiturgyView from "@/components/service/ServiceLiturgyView";
import ServiceView from "@/components/service/ServiceView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { readStorage, writeStorage } from "@/hooks/useLocalStorageState";
import { ListOrdered, Music } from "lucide-react";
import { useEffect, useState } from "react";

type ServiceViewTab = "liturgia" | "cifras";
const VIEW_STORAGE_KEY = "liturgia:visao";

type ClientPageProps = { serviceSlug: string };
export default function ClientPage({ serviceSlug }: ClientPageProps) {
  const { service } = useFetchService(serviceSlug);
  // Começa em Liturgia (igual no servidor) e aplica a última visão do aparelho após montar.
  const [view, setView] = useState<ServiceViewTab>("liturgia");

  useEffect(() => {
    if (readStorage<string>(VIEW_STORAGE_KEY, "liturgia") === "cifras") setView("cifras");
  }, []);

  function handleViewChange(next: string) {
    const nextView: ServiceViewTab = next === "cifras" ? "cifras" : "liturgia";
    setView(nextView);
    writeStorage(VIEW_STORAGE_KEY, nextView);
  }

  return (
    <ServiceConfigProvider>
      {/* Cabeçalho branco na consulta: sobrepõe o fundo do PageHeader sem alterar o componente compartilhado. */}
      <div className="stage-mode-hidden [&>div]:bg-background">
        <ServiceHeader service={service} />
      </div>

      <Tabs value={view} onValueChange={handleViewChange} className="flex flex-col gap-0">
        <div className="stage-mode-hidden px-4 sm:px-5 lg:px-8 pb-4">
          <TabsList aria-label="Visão do culto" className="h-11 p-1 bg-muted/50">
            <TabsTrigger value="liturgia" className="h-full min-w-24 px-4 cursor-pointer">
              <ListOrdered aria-hidden="true" />
              Roteiro
            </TabsTrigger>
            <TabsTrigger value="cifras" className="h-full min-w-24 px-4 cursor-pointer">
              <Music aria-hidden="true" />
              Cifras
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="liturgia" className="mt-0">
          <Main className="px-4 sm:px-5 lg:px-8 pt-2 pb-4 sm:pb-5 lg:pb-8">
            <ServiceLiturgyView service={service} />
          </Main>
        </TabsContent>

        <TabsContent value="cifras" className="mt-0">
          <MainWithDensity>
            <ServiceView service={service ?? null} />
          </MainWithDensity>
        </TabsContent>
      </Tabs>
    </ServiceConfigProvider>
  );
}

function MainWithDensity({ children }: { children: React.ReactNode }) {
  const { density } = useServiceConfig();
  return (
    <Main density={density} className="px-4 sm:px-5 lg:px-8 pt-2 pb-4 sm:pb-5 lg:pb-8">
      {children}
    </Main>
  );
}
