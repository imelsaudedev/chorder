"use client";

import { Button } from "@/components/ui/button";
import { LayoutTemplate, Plus } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useNewService } from "./NewServiceProvider";

type ServicesHeaderActionsProps = {
  canManageChurch?: boolean;
  isAdmin?: boolean;
};

/**
 * Ações do cabeçalho de Liturgias: Modelos (apenas Admin) e
 * Nova liturgia (na aba Igreja apenas para Louvor/Admin; em Minhas liturgias para qualquer usuário logado).
 */
export default function ServicesHeaderActions({
  canManageChurch = false,
  isAdmin = false,
}: ServicesHeaderActionsProps) {
  const t = useTranslations("Messages");
  const { activeScope, openNewService, personalEmpty } = useNewService();

  // Lista pessoal vazia: o botão do próprio estado vazio é o único chamado para criar.
  const canCreateInCurrentTab =
    (activeScope === "PERSONAL" && !personalEmpty) || (activeScope === "CHURCH" && canManageChurch);

  return (
    <>
      {isAdmin && (
        <Button asChild variant="outline" className="max-sm:size-9 max-sm:px-0">
          <Link href="/admin/templates" aria-label="Modelos de liturgia">
            <LayoutTemplate />
            <span className="max-sm:hidden">Modelos</span>
          </Link>
        </Button>
      )}
      {canCreateInCurrentTab && (
        <Button
          type="button"
          variant="secondary"
          className="max-sm:hidden"
          onClick={() => openNewService(activeScope)}
        >
          <Plus />
          {t("newService")}
        </Button>
      )}
    </>
  );
}
