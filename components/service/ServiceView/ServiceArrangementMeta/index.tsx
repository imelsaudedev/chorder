import EditOrSaveCancelGroup from "@/components/service/ServiceView/EditOrSaveCancelGroup";
import KeySelectorButton from "@/components/service/ServiceView/KeySelectorButton";
import ServiceMediaReferences from "@/components/service/ServiceView/ServiceMediaReferences";
import { ClientArrangement } from "@/prisma/models";

type Props = {
  arrangement: ClientArrangement;
  isEditing: boolean;
  isSaving: boolean;
  isDirty: boolean;
  onStartEdit: () => void;
  onCancel: () => void;
  onSaveServiceOnly: () => void;
  onSaveBoth: () => void;
};

// Linha de controles (tom + referências + lápis/salvar/cancelar), só pra
// mobile — no desktop os mesmos controles já aparecem dentro da linha do
// título, em ServiceArrangementHeader (ver item 5: "voltar ao padrão título
// à esquerda, ações à direita" não cabia junto do título no celular — D1).
export default function ServiceArrangementMeta({
  arrangement,
  isEditing,
  isSaving,
  isDirty,
  onStartEdit,
  onCancel,
  onSaveServiceOnly,
  onSaveBoth,
}: Props) {
  if (!arrangement.song) return null;

  const hasOriginal = !!arrangement.originalArrangementId;

  return (
    <div className="flex flex-wrap items-center gap-2 pb-3 md:hidden">
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

      <div className="ml-auto">
        <EditOrSaveCancelGroup
          isEditing={isEditing}
          isSaving={isSaving}
          isDirty={isDirty}
          hasOriginal={hasOriginal}
          onStartEdit={onStartEdit}
          onCancel={onCancel}
          onSaveServiceOnly={onSaveServiceOnly}
          onSaveBoth={onSaveBoth}
        />
      </div>
    </div>
  );
}
