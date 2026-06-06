"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";

type SaveScopeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  songTitle: string;
  isSaving: boolean;
  onSaveServiceOnly: () => void;
  onSaveWithOriginal: () => void;
};

export default function SaveScopeDialog({
  open,
  onOpenChange,
  songTitle,
  isSaving,
  onSaveServiceOnly,
  onSaveWithOriginal,
}: SaveScopeDialogProps) {
  const t = useTranslations("ServiceView");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("saveScopeTitle")} — {songTitle}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            onClick={onSaveServiceOnly}
            data-testid="save-service-only"
          >
            {t("serviceOnly")}
          </Button>
          <Button
            type="button"
            disabled={isSaving}
            onClick={onSaveWithOriginal}
            data-testid="save-with-original"
          >
            {t("serviceAndOriginal")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
