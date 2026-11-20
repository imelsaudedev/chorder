"use client";

import { Button } from "@/components/ui/button";
import { LayoutTemplate, Plus } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useNewService } from "./NewServiceProvider";

/**
 * Ações do cabeçalho de Liturgias: Modelos (secundária; só o ícone no celular) e
 * Nova liturgia (principal a partir do tablet; no celular vale o botão flutuante).
 */
export default function ServicesHeaderActions() {
  const t = useTranslations("Messages");
  const { openNewService } = useNewService();

  return (
    <>
      <Button asChild variant="outline" className="max-sm:size-9 max-sm:px-0">
        <Link href="/admin/templates" aria-label="Modelos de liturgia">
          <LayoutTemplate />
          <span className="max-sm:hidden">Modelos</span>
        </Link>
      </Button>
      <Button type="button" variant="secondary" className="max-sm:hidden" onClick={openNewService}>
        <Plus />
        {t("newService")}
      </Button>
    </>
  );
}
