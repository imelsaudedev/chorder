import Heading from "@/components/common/Heading";
import { useSongConfig } from "@/components/config/SongConfig";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientArrangement } from "@/prisma/models";
import { Check, Loader2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { forwardRef, useState } from "react";

// Só o título (+ Salvar/Cancelar em edição) é sticky — tom, referências,
// aviso de plano e mapa rolam com a página (ver D1 na análise/plano:
// cabeçalho inteiro sticky ocupava espaço demais no celular).
type ServiceArrangementHeaderProps = {
  arrangement: ClientArrangement | null;
  order: number;
  isEditing: boolean;
  isSaving: boolean;
  isStuck?: boolean;
  onCancel: () => void;
  onSaveServiceOnly: () => void;
  onSaveBoth: () => void;
};

const ServiceArrangementHeader = forwardRef<HTMLDivElement, ServiceArrangementHeaderProps>(
function ServiceArrangementHeader({
  arrangement,
  order,
  isEditing,
  isSaving,
  isStuck = false,
  onCancel,
  onSaveServiceOnly,
  onSaveBoth,
}: ServiceArrangementHeaderProps, ref) {
  const { density } = useSongConfig();
  const t = useTranslations("ServiceView");
  const [scopeDialogOpen, setScopeDialogOpen] = useState(false);

  if (!arrangement) {
    return (
      <div ref={ref} className={`sticky top-0 bg-background z-10 flex w-full flex-row justify-between items-center py-2 md:py-2 lg:py-4 ${isStuck ? "border-b border-border" : ""}`}>
        <Skeleton className="w-1/3 h-12 bg-muted" />
        <Skeleton className="w-16 h-12 bg-gray-200" />
      </div>
    );
  }

  if (!arrangement.song) {
    throw new Error("Arrangement song is not available");
  }

  const hasOriginal = !!arrangement.originalArrangementId;

  return (
    <div
      ref={ref}
      className={`sticky top-0 bg-background z-10 flex w-full flex-row justify-between items-center ${isStuck ? "border-b border-border" : ""} ${
        density === "compact" ? "py-2 md:py-1 lg:py-2" : "py-2 md:py-2 lg:py-4"
      }`}
    >
      <div className="flex flex-col min-w-0 flex-1 mr-2">
        <Heading level={2} className="truncate">
          <span>{order}. </span>
          {arrangement.song.title}
        </Heading>
      </div>

      {isEditing && (
        <div className="flex items-center gap-1 md:gap-2">
          <Button
            type="button"
            size="icon"
            disabled={isSaving}
            onClick={() => hasOriginal ? setScopeDialogOpen(true) : onSaveServiceOnly()}
            aria-label={t("saveChanges")}
            className="h-8 w-8 md:size-auto md:h-9 md:px-4 md:py-2"
          >
            {isSaving
              ? <Loader2 size={14} className="animate-spin" />
              : <Check size={16} className="md:hidden" />
            }
            <span className="hidden md:inline">{t("saveChanges")}</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onCancel}
            aria-label={t("cancelEdit")}
            disabled={isSaving}
            className="h-8 w-8 md:size-9"
          >
            <X size={18} />
          </Button>
          <Dialog open={scopeDialogOpen} onOpenChange={setScopeDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("saveScopeTitle")}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setScopeDialogOpen(false); onSaveServiceOnly(); }}
                >
                  {t("serviceOnly")}
                </Button>
                <Button
                  type="button"
                  onClick={() => { setScopeDialogOpen(false); onSaveBoth(); }}
                >
                  {t("serviceAndOriginal")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
});

export default ServiceArrangementHeader;
