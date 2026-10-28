import KeyButtonSet from "@/components/config/KeyButtonSet";
import { useSongConfig } from "@/components/config/SongConfig";
import ServiceMediaReferences from "@/components/service/ServiceView/ServiceMediaReferences";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { transposeChord } from "@/chopro/music";
import { ClientArrangement } from "@/prisma/models";
import { Check, ChevronDown, Loader2, Pencil, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

type Props = {
  arrangement: ClientArrangement;
  isEditing: boolean;
  isSaving: boolean;
  onStartEdit: () => void;
  onCancel: () => void;
  onSaveServiceOnly: () => void;
  onSaveBoth: () => void;
};

// Linha de "Autor · Arranjo", linha de controles (tom + referências + lápis)
// e aviso de "No plano" — tudo fora da parte sticky (ver ServiceArrangementHeader).
// Na edição de cifra, tom some e o lápis dá lugar a Salvar/Cancelar no mesmo
// lugar (mesma posição, sem pular o layout); as referências continuam
// acessíveis: mídia é independente da cifra (D2).
export default function ServiceArrangementMeta({
  arrangement,
  isEditing,
  isSaving,
  onStartEdit,
  onCancel,
  onSaveServiceOnly,
  onSaveBoth,
}: Props) {
  const { transpose, setTranspose } = useSongConfig();
  const t = useTranslations("ServiceView");
  const [tomOpen, setTomOpen] = useState(false);
  const [scopeDialogOpen, setScopeDialogOpen] = useState(false);

  if (!arrangement.song) return null;

  const metaParts = [arrangement.song.artist, arrangement.name].filter(
    (part): part is string => !!part
  );
  const effectiveKey = arrangement.key
    ? transposeChord(arrangement.key, arrangement.key, transpose)
    : "";
  const inPlan = transpose === 0;
  const hasOriginal = !!arrangement.originalArrangementId;

  return (
    <div className="flex flex-col gap-2 pb-3">
      {metaParts.length > 0 && (
        <p className="truncate text-sm text-muted-foreground">{metaParts.join(" · ")}</p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {!isEditing && arrangement.key && (
          <>
            <div className="md:hidden">
              <Popover open={tomOpen} onOpenChange={setTomOpen}>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" size="sm" className="h-10 gap-1">
                    {t("keyButtonLabel", { key: effectiveKey })}
                    <ChevronDown size={14} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="start">
                  <KeyButtonSet
                    originalKey={arrangement.key}
                    transpose={transpose}
                    setTranspose={setTranspose}
                    size="sm"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="hidden md:flex">
              <KeyButtonSet
                originalKey={arrangement.key}
                transpose={transpose}
                setTranspose={setTranspose}
              />
            </div>
          </>
        )}

        {arrangement.songId && (
          <ServiceMediaReferences
            songId={arrangement.songId}
            originalArrangementId={arrangement.originalArrangementId ?? null}
            youtubeUrl={arrangement.youtubeUrl ?? null}
            audios={arrangement.audios}
            title={arrangement.song.title}
          />
        )}

        {isEditing ? (
          <div className="ml-auto flex items-center gap-1">
            <Button
              type="button"
              size="icon"
              disabled={isSaving}
              onClick={() => (hasOriginal ? setScopeDialogOpen(true) : onSaveServiceOnly())}
              aria-label={t("saveChanges")}
              className="h-10 w-10"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onCancel}
              aria-label={t("cancelEdit")}
              disabled={isSaving}
              className="h-10 w-10"
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
        ) : (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onStartEdit}
            aria-label={t("editChords")}
            className="ml-auto h-10 w-10"
          >
            <Pencil size={16} />
          </Button>
        )}
      </div>

      {!isEditing && !inPlan && arrangement.key && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{t("inPlanLabel", { key: arrangement.key })}</span>
          <button
            type="button"
            className="font-medium text-primary hover:underline"
            onClick={() => setTranspose(0)}
          >
            {t("backToPlan")}
          </button>
        </div>
      )}
    </div>
  );
}
