import Heading from "@/components/common/Heading";
import { useSongConfig } from "@/components/config/SongConfig";
import EditOrSaveCancelGroup from "@/components/service/ServiceView/EditOrSaveCancelGroup";
import KeySelectorButton from "@/components/service/ServiceView/KeySelectorButton";
import ServiceMediaReferences from "@/components/service/ServiceView/ServiceMediaReferences";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientArrangement } from "@/prisma/models";
import { forwardRef } from "react";

// Só o título é sticky no celular — tom, referências e salvar/cancelar ficam
// em ServiceArrangementMeta, fora da parte sticky, pra não ocupar espaço fixo
// na tela (D1). No desktop, sobra espaço: os mesmos controles entram nesta
// mesma linha, à direita do título (item 5 — "título à esquerda, ações à
// direita"). Autor/compositor não aparece aqui — vai depois da cifra
// (ver ServiceSongUnitView), e referências somem durante a edição de cifra.
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
  const { density } = useSongConfig();

  if (!arrangement) {
    return (
      <div ref={ref} className="sticky top-0 bg-background z-10 flex w-full flex-row justify-between items-center py-2 md:py-2 lg:py-4">
        <Skeleton className="w-1/3 h-12 bg-muted" />
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
      className={`sticky top-0 bg-background z-10 flex w-full flex-row items-center gap-2 pb-2 ${isStuck ? "border-b border-border" : ""} ${
        density === "compact" ? "pt-2 md:pt-1 lg:pt-2" : "pt-2 md:pt-2 lg:pt-4"
      }`}
    >
      <div className="flex min-w-0 flex-1">
        <Heading level={2} className="truncate">
          <span>{order}. </span>
          {arrangement.song.title}
        </Heading>
      </div>

      <div className="hidden md:flex items-center gap-2 shrink-0">
        {!isEditing && arrangement.key && <KeySelectorButton originalKey={arrangement.key} />}

        {!isEditing && arrangement.songId && (
          <ServiceMediaReferences
            songId={arrangement.songId}
            originalArrangementId={arrangement.originalArrangementId ?? null}
            youtubeUrl={arrangement.youtubeUrl ?? null}
            audios={arrangement.audios}
            title={arrangement.song.title}
          />
        )}

        <EditOrSaveCancelGroup
          isEditing={isEditing}
          isSaving={isSaving}
          hasOriginal={hasOriginal}
          onStartEdit={onStartEdit}
          onCancel={onCancel}
          onSaveServiceOnly={onSaveServiceOnly}
          onSaveBoth={onSaveBoth}
        />
      </div>
    </div>
  );
});

export default ServiceArrangementHeader;
