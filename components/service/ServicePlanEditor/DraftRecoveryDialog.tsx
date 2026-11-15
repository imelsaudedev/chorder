"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PlanDraft } from "./hooks/usePlanDraft";

type DraftRecoveryDialogProps = {
  draft: PlanDraft | null;
  conflict: boolean;
  onRestore: () => void;
  onDiscard: () => void;
};

export default function DraftRecoveryDialog({
  draft,
  conflict,
  onRestore,
  onDiscard,
}: DraftRecoveryDialogProps) {
  const when = draft
    ? new Date(draft.savedAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
    : "";

  return (
    <AlertDialog open={!!draft}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {conflict ? "Rascunho de uma versão anterior" : "Recuperar rascunho?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {conflict
              ? `Você tem um rascunho deste aparelho de ${when}, mas a liturgia foi alterada por outra pessoa depois dele. Se usar o rascunho, as alterações dessa pessoa serão sobrescritas ao salvar.`
              : `Há alterações deste roteiro que não foram salvas, guardadas neste aparelho em ${when}.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onDiscard}>Descartar rascunho</AlertDialogCancel>
          <AlertDialogAction onClick={onRestore}>
            {conflict ? "Usar meu rascunho" : "Recuperar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
