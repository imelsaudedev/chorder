import Heading from "@/components/common/Heading";
import KeyButtonSet from "@/components/config/KeyButtonSet";
import { useSongConfig } from "@/components/config/SongConfig";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientArrangement } from "@/prisma/models";
import AudioReferenceButton from "@/components/common/AudioReferenceButton";
import YoutubeReferenceButton from "@/components/common/YoutubeReferenceButton";
import { transposeChord } from "@/chopro/music";
import { Check, Loader2, MoreVertical, Pencil, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { forwardRef, useState } from "react";

type ServiceArrangementHeaderProps = {
  arrangement: ClientArrangement | null;
  order: number;
  isEditing: boolean;
  isSaving: boolean;
  isStuck?: boolean;
  onStartEdit: () => void;
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
  onStartEdit,
  onCancel,
  onSaveServiceOnly,
  onSaveBoth,
}: ServiceArrangementHeaderProps, ref) {
  const { transpose, setTranspose, density } = useSongConfig();
  const t = useTranslations("ServiceView");
  const tGlobal = useTranslations("Messages");
  const [scopeDialogOpen, setScopeDialogOpen] = useState(false);
  const effectiveKey = arrangement?.key
    ? transposeChord(arrangement.key, arrangement.key, transpose)
    : "";

  if (!arrangement) {
    return (
      <div ref={ref} className={`sticky top-0 bg-white z-10 flex w-full flex-row justify-between items-center py-2 md:py-2 lg:py-4 ${isStuck ? "border-b border-zinc-200" : ""}`}>
        <Skeleton className="w-1/3 h-12 bg-gray-500" />
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
      className={`sticky top-0 bg-white z-10 flex w-full flex-row justify-between items-center ${isStuck ? "border-b border-zinc-200" : ""} ${
        density === "compact" ? "py-2 md:py-1 lg:py-2" : "py-2 md:py-2 lg:py-4"
      }`}
    >
      <div className="flex flex-col min-w-0 flex-1 mr-2">
        <Heading level={3} className="truncate">
          <span>{order}. </span>
          {arrangement.song.title}
        </Heading>
      </div>

      <div className="key-controls flex items-center gap-1 md:gap-2 fullscreen-hidden">
        {/* Media buttons — só fora do modo edição */}
        {!isEditing && arrangement.youtubeUrl && (
          <YoutubeReferenceButton
            youtubeUrl={arrangement.youtubeUrl}
            title={arrangement.song.title}
          />
        )}
        {!isEditing && (arrangement.audios?.length ?? 0) > 0 && (
          <AudioReferenceButton
            audios={arrangement.audios!}
            title={arrangement.song.title}
          />
        )}

        {/* Tom — só no modo visualização; na edição fica no dicionário */}
        {!isEditing && (
          <div className="hidden md:flex">
            <KeyButtonSet
              originalKey={arrangement.key || ""}
              transpose={transpose}
              setTranspose={setTranspose}
            />
          </div>
        )}
        {!isEditing ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="md:hidden flex h-8 w-8 md:size-9" variant="ghost" size="icon">
                <MoreVertical size={20} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={4}>
              <DropdownMenuItem asChild>
                <KeyButtonSet
                  originalKey={arrangement.key || ""}
                  transpose={transpose}
                  setTranspose={setTranspose}
                />
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={onStartEdit}>
                <Pencil size={14} className="mr-2" />
                {t("editChords")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}

        {/* Desktop: lápis standalone; mobile: está no ⋮ acima */}
        {!isEditing ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onStartEdit}
            className="hidden md:flex"
          >
            <Pencil size={16} />
          </Button>
        ) : (
          <>
            <Button
              type="button"
              size="icon"
              disabled={isSaving}
              onClick={() => hasOriginal ? setScopeDialogOpen(true) : onSaveServiceOnly()}
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
          </>
        )}
      </div>
    </div>
  );
});

export default ServiceArrangementHeader;
