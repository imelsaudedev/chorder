"use client";

import { useFetchServicesList } from "#api-client";
import ServiceList from "@/components/service/ServiceList";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useNewService } from "./NewServiceProvider";

type ClientServiceListProps = {
  scope?: "church" | "personal";
};

export default function ClientServiceList({ scope = "church" }: ClientServiceListProps) {
  const t = useTranslations("Service");
  const { openNewService, setPersonalEmpty } = useNewService();
  const { services, isLoading } = useFetchServicesList(scope);
  const showPersonalEmpty = scope === "personal" && !!services && !isLoading && services.length === 0;

  // Avisa a tela: com o estado vazio na tela, só ele oferece "Criar liturgia".
  useEffect(() => {
    setPersonalEmpty(showPersonalEmpty);
    return () => setPersonalEmpty(false);
  }, [showPersonalEmpty, setPersonalEmpty]);

  if (!services || isLoading) {
    return null;
  }

  if (showPersonalEmpty) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-14 text-center">
        <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-secondary/10 text-secondary">
          <Users className="size-6" aria-hidden="true" />
        </div>
        <h2 className="text-base font-semibold text-foreground">
          {t("personalEmptyTitle")}
        </h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {t("personalEmptyDescription")}
        </p>
        <Button
          type="button"
          variant="secondary"
          className="mt-5"
          onClick={() => openNewService("PERSONAL")}
        >
          <Plus className="size-4" />
          {t("newPersonalService")}
        </Button>
      </div>
    );
  }

  return <ServiceList services={services} />;
}
