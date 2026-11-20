import Text from "@/components/common/Text";
import { useSongConfig } from "@/components/config/SongConfig";
import EditOrSaveCancelGroup from "@/components/service/ServiceView/EditOrSaveCancelGroup";
import KeySelectorButton from "@/components/service/ServiceView/KeySelectorButton";
import ServiceMediaReferences from "@/components/service/ServiceView/ServiceMediaReferences";
import SongMap, { SongMapUnit } from "@/components/song/SongMap";
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
  /** Título mostrado na liturgia (o próprio do item, se houver); sem ele, o cadastrado da música. */
  title?: string;
  order: number;
  isEditing: boolean;
  isSaving: boolean;
  isDirty: boolean;
  isStuck?: boolean;
  /**
   * Blocos da música: viram o mapa (chips) logo abaixo do título. Parado: título grande e chips
   * normais (quebram em linhas). Preso no topo: o MESMO título, só com o corpo menor, e chips
   * pequenos numa linha, como no Modo Palco — com transição suave. Ausente na edição (o editor
   * tem o próprio mapa).
   */
  mapUnits?: SongMapUnit[];
  onSelectMapUnit?: (index: number) => void;
  /**
   * Vão vertical entre blocos da cifra, em px (--block-gap: 1em normal / 0.5em compacto, na fonte
   * da cifra). É o vão entre o título e o mapa, e entre o mapa (ou o título, na edição) e o conteúdo.
   */
  blockGapPx?: number;
  onStartEdit: () => void;
  onCancel: () => void;
  onSaveServiceOnly: () => void;
  onSaveBoth: () => void;
  /**
   * Controles do celular (tom, referências, editar): linha entre o título e o mapa. No desktop
   * (md+) esses controles ficam na linha do título; preso no topo a linha some (só título e mapa).
   */
  mobileControls?: React.ReactNode;
};

const ServiceArrangementHeader = forwardRef<HTMLDivElement, ServiceArrangementHeaderProps>(
function ServiceArrangementHeader({
  arrangement,
  title,
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
  mobileControls,
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
  // sempre em cima e, embaixo, o vão entre blocos (inline, em px) — com mapa é o que separa o
  // mapa da cifra; na edição, o que separa o título do editor (que começa pelo próprio mapa).
  const spacingClass = isStuck
    ? "py-3.5"
    : density === "compact"
    ? "pt-2 md:pt-1 lg:pt-2"
    : "pt-2 md:pt-2 lg:pt-4";

  return (
    <div
      ref={ref}
      // A borda existe sempre (transparente parado) pra não mudar a altura ao grudar.
      className={`sticky top-0 bg-background z-10 flex w-full flex-col border-b ${
        isStuck ? "border-border" : "border-transparent"
      } ${spacingClass}`}
      style={isStuck ? undefined : { paddingBottom: blockGapPx }}
    >
      <div className="flex w-full flex-row items-center gap-2">
      <div className={`flex min-w-0 flex-1 items-center ${isStuck ? "h-5" : "h-8"}`}>
        {/* Sempre o mesmo título (mesma fonte, peso e espaçamento): preso, só o corpo diminui. */}
        <Text variant="heading-lg" as="h2" size={isStuck ? "base" : undefined} className="truncate">
          <span>{order}. </span>
          {title || arrangement.song.title}
        </Text>
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

      {/* Celular: tom, referências e editar logo abaixo do título e acima do mapa. Preso, some
          (`hidden`, sem desmontar, para não fechar um menu aberto ao rolar). */}
      {mobileControls && <div className={isStuck ? "hidden" : "mt-2 md:hidden"}>{mobileControls}</div>}

      {/* Mapa logo abaixo do título; tocar rola até o bloco. Parado: chips normais, a um vão entre
          blocos do título. Preso: uma linha de chips pequenos (como no Modo Palco). */}
      {hasMap && (
        <div
          // Preso: o vão entre o título (16px, linha de 20px) e os chips é só ~4px — o bastante para não encostar.
          className={`flex items-center ${isStuck ? "mt-0.5" : ""}`}
          style={isStuck ? undefined : { marginTop: blockGapPx }}
        >
          {/* fitSmall: preso, os chips ficam pequenos (24px) em qualquer tela, inclusive no desktop. */}
          <SongMap fit={isStuck} fitSmall units={mapUnits ?? []} onSelectUnit={onSelectMapUnit} />
        </div>
      )}
    </div>
  );
});

export default ServiceArrangementHeader;
