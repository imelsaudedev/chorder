"use client";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ClientService } from "@/prisma/models";
import { Pencil, Share2, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import HolyricsSetlistButton from "./ServiceHeader/HolyricsSetlistButton";
import ServiceConfig from "./ServiceHeader/ServiceConfig";

// No celular só o ícone (quadrado); a partir de sm, ícone + rótulo.
const RESPONSIVE = "max-sm:w-9 max-sm:px-0";

type ServiceActionsBarProps = {
  service: ClientService;
  view: "liturgia" | "cifras";
};

/** Ações contextuais da aba ativa, na linha do toggle Roteiro/Cifras. */
export default function ServiceActionsBar({ service, view }: ServiceActionsBarProps) {
  return (
    <div className="flex items-center gap-2">
      {view === "liturgia" ? (
        <>
          <ShareButton service={service} />
          <EditPlanButton />
        </>
      ) : (
        <>
          <HolyricsSetlistButton service={service} />
          <ConfigButton />
        </>
      )}
    </div>
  );
}

function EditPlanButton() {
  const t = useTranslations("Messages");
  const pathname = usePathname();
  return (
    <Button asChild aria-label={t("editPlan")} className={RESPONSIVE}>
      <Link href={`${pathname}/edit`}>
        <Pencil aria-hidden="true" />
        <span className="hidden sm:inline">{t("editPlan")}</span>
      </Link>
    </Button>
  );
}

function ShareButton({ service }: { service: ClientService }) {
  const t = useTranslations("Messages");

  async function handleShare() {
    const url = window.location.href;
    const title = service.title?.trim() || t("service");
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // Cancelado pelo usuário: nada a fazer.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t("linkCopied"));
    } catch {
      toast.error(url);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleShare}
      aria-label={t("share")}
      className={RESPONSIVE}
    >
      <Share2 aria-hidden="true" />
      <span className="hidden sm:inline">{t("share")}</span>
    </Button>
  );
}

function ConfigButton() {
  const t = useTranslations("Messages");
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" aria-label={t("layout")} className={RESPONSIVE}>
          <SlidersHorizontal aria-hidden="true" />
          <span className="hidden sm:inline">{t("layout")}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <ServiceConfig />
      </PopoverContent>
    </Popover>
  );
}
