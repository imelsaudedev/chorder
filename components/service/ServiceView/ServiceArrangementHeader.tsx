import Heading from "@/components/common/Heading";
import { useSongConfig } from "@/components/config/SongConfig";
import EditOrSaveCancelGroup from "@/components/service/ServiceView/EditOrSaveCancelGroup";
import KeySelectorButton from "@/components/service/ServiceView/KeySelectorButton";
import ServiceMediaReferences from "@/components/service/ServiceView/ServiceMediaReferences";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientArrangement } from "@/prisma/models";
import SongMap, { SongMapUnit } from "@/components/song/SongMap";
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
  isDirty: boolean;
  isStuck?: boolean;
  /**
   * Blocos da música: viram o mapa (chips) logo abaixo do título. Parado: título grande e chips
   * normais (quebram em linhas), com o vão entre blocos da cifra (1× entre mapa e cifra, 2× entre
   * título e mapa). Preso no topo: título menor e chips pequenos numa linha, como no Modo Palco.
   * Ausente na edição (o editor tem o próprio mapa).
   */
  mapUnits?: SongMapUnit[];
  onSelectMapUnit?: (index: number) => void;
  /** Vão vertical entre blocos da cifra, em px (--block-gap: 1em normal / 0.5em compacto, na fonte da cifra). */
  blockGapPx?: number;
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
  isDirty,
  isStuck = false,
  mapUnits,
  onSelectMapUnit,
  blockGapPx = 16,
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
  const hasMap = !!mapUnits && mapUnits.length > 0;

  // Preso no topo: mesmo padding vertical do cabeçalho do Modo Palco (py-3.5). Parado: o de
  // sempre em cima e, com mapa, o vão entre blocos embaixo (é ele que separa o mapa da cifra).
  const spacingClass = isStuck
    ? "py-3.5"
    : `${density === "compact" ? "pt-2 md:pt-1 lg:pt-2" : "pt-2 md:pt-2 lg:pt-4"} ${hasMap ? "" : "pb-2"}`;

  return (
    <div
      ref={ref}
      className={`sticky top-0 bg-background z-10 flex w-full flex-col ${isStuck ? "border-b border-border" : ""} ${spacingClass}`}
      style={!isStuck && hasMap ? { paddingBottom: blockGapPx } : undefined}
    >
      <div className="flex w-full flex-row items-center gap-2">
      <div className={`flex min-w-0 flex-1 items-center ${isStuck ? "h-6" : "min-h-8"}`}>
        {isStuck ? (
          // Preso: título menor, igual ao do Modo Palco.
          <span className="truncate text-[15px] font-semibold">
            <span className="text-muted-foreground tabular-nums">{order}. </span>
            {arrangement.song.title}
          </span>
        ) : (
          <Heading level={2} className="truncate">
            <span>{order}. </span>
            {arrangement.song.title}
          </Heading>
        )}
      </div>

      <div className="hidden md:flex items-center gap-2 shrink-0">
        {/* Visível também durante a edição (achado em teste manual: "não é
            possível alterar o tom pois escondemos o botão de tonalidade")
            — seguro porque a edição sempre trabalha no tom base (D9),
            trocar o tom do culto aqui só muda o aviso "o tom do culto
            volta ao salvar" exibido no editor, não o que está sendo
            editado. */}
        {arrangement.key && <KeySelectorButton originalKey={arrangement.key} />}

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
          isDirty={isDirty}
          hasOriginal={hasOriginal}
          onStartEdit={onStartEdit}
          onCancel={onCancel}
          onSaveServiceOnly={onSaveServiceOnly}
          onSaveBoth={onSaveBoth}
        />
      </div>
      </div>

      {/* Mapa logo abaixo do título; tocar rola até o bloco. Preso: uma linha de chips
          pequenos (como no Modo Palco). Parado: chips normais, a 2× o vão entre blocos do título. */}
      {hasMap && (
        <div
          className={`flex items-center ${isStuck ? "mt-1 h-7" : ""}`}
          style={isStuck ? undefined : { marginTop: blockGapPx * 2 }}
        >
          <SongMap fit={isStuck} units={mapUnits ?? []} onSelectUnit={onSelectMapUnit} />
        </div>
      )}
    </div>
  );
});

export default ServiceArrangementHeader;
