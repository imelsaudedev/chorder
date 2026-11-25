"use client";

import { useFetchService } from "#api-client";
import Main from "@/components/common/Main";
import ServiceConfigProvider, {
  useServiceConfig,
} from "@/components/config/ServiceConfig";
import ServiceActionsBar from "@/components/service/ServiceActionsBar";
import ServiceHeader from "@/components/service/ServiceHeader";
import ServiceLiturgyView from "@/components/service/ServiceLiturgyView";
import ServiceView from "@/components/service/ServiceView";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { readStorage, writeStorage } from "@/hooks/useLocalStorageState";
import { ListOrdered, Loader2, Lock, Music } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

type ServiceViewTab = "liturgia" | "cifras";
const VIEW_STORAGE_KEY = "liturgia:visao";

type ClientPageProps = { serviceSlug: string; shareToken?: string | null };
export default function ClientPage({ serviceSlug, shareToken = null }: ClientPageProps) {
  const t = useTranslations("Service");
  const { mutate } = useSWRConfig();
  const { service } = useFetchService(serviceSlug, shareToken);
  const [publishing, setPublishing] = useState(false);
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

  async function handlePublish() {
    if (!service) return;
    setPublishing(true);
    try {
      const res = await fetch(`/api/services/${service.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PUBLISHED" }),
      });
      if (!res.ok) throw new Error("Failed to publish");
      await Promise.all([
        mutate(`/api/services/${serviceSlug}`),
        mutate("/api/services?view=list"),
      ]);
      toast.success(t("draftPublishedToast"));
    } catch {
      toast.error(t("publishError"));
    } finally {
      setPublishing(false);
    }
  }

  return (
    <ServiceConfigProvider>
      {/* Cabeçalho branco na consulta: sobrepõe o fundo do PageHeader sem alterar o componente compartilhado. */}
      <div className="stage-mode-hidden [&>div]:bg-background">
        <ServiceHeader service={service} />
      </div>

      {service?.status === "DRAFT" && (
        <div className="stage-mode-hidden px-page pb-3">
          <div
            role="status"
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-warning-border bg-warning-bg px-4 py-2.5 text-sm text-warning-text"
          >
            <span className="inline-flex items-center gap-2 font-medium">
              <Lock className="size-4 shrink-0" aria-hidden="true" />
              {t("draftBannerText")}
            </span>
            {service.canDelete !== false && (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={publishing}
                onClick={handlePublish}
              >
                {publishing ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  t("publishService")
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      <Tabs value={view} onValueChange={handleViewChange} className="flex flex-col gap-0">
        <div className="stage-mode-hidden flex items-center justify-between gap-2 px-page pb-4">
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
          {service && <ServiceActionsBar service={service} view={view} />}
        </div>

        <TabsContent value="liturgia" className="mt-0">
          <Main className="pt-2 pb-4 sm:pb-5 lg:pb-8">
            <ServiceLiturgyView service={service} />
          </Main>
        </TabsContent>

        <TabsContent value="cifras" className="mt-0">
          <Main className="pt-2 pb-4 sm:pb-5 lg:pb-8">
            <ServiceView service={service ?? null} />
          </Main>
        </TabsContent>
      </Tabs>
    </ServiceConfigProvider>
  );
}
