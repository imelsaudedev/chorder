"use client";

import ConfirmDiscardDialog from "@/components/common/ConfirmDiscardDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, Loader2, Pencil, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

type Props = {
  isEditing: boolean;
  isSaving: boolean;
  // D11: confirmar o X só quando há alteração — mesmo padrão já usado em
  // ArrangementForm/index.tsx (isDirty + ConfirmDiscardDialog).
  isDirty: boolean;
  hasOriginal: boolean;
  onStartEdit: () => void;
  onCancel: () => void;
  onSaveServiceOnly: () => void;
  onSaveBoth: () => void;
};

// Fora da edição, mostra só o lápis; durante a edição, o lápis dá lugar a
// Salvar/Cancelar no mesmo lugar, usado tanto no cabeçalho (desktop) quanto
// em ServiceArrangementMeta (mobile) pra não duplicar lógica. Altura sempre
// h-10 no celular / h-9 no desktop — mesmo padrão do tom e das referências.
export default function EditOrSaveCancelGroup({
  isEditing,
  isSaving,
  isDirty,
  hasOriginal,
  onStartEdit,
  onCancel,
  onSaveServiceOnly,
  onSaveBoth,
}: Props) {
  const t = useTranslations("ServiceView");
  const [scopeDialogOpen, setScopeDialogOpen] = useState(false);

  if (!isEditing) {
    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onStartEdit}
        aria-label={t("editChords")}
        className="h-10 w-10 md:h-9 md:w-9"
      >
        <Pencil size={16} />
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        size="sm"
        disabled={isSaving}
        onClick={() => (hasOriginal ? setScopeDialogOpen(true) : onSaveServiceOnly())}
        className="h-10 md:h-9 gap-1.5 px-3"
      >
        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
        {t("saveChanges")}
      </Button>
      {isDirty ? (
        <ConfirmDiscardDialog onDiscard={onCancel}>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={t("cancelEdit")}
            disabled={isSaving}
            className="h-10 w-10 md:h-9 md:w-9"
          >
            <X size={18} />
          </Button>
        </ConfirmDiscardDialog>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onCancel}
          aria-label={t("cancelEdit")}
          disabled={isSaving}
          className="h-10 w-10 md:h-9 md:w-9"
        >
          <X size={18} />
        </Button>
      )}
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
  );
}
