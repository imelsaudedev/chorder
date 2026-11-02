import { useServiceConfig } from "@/components/config/ServiceConfig";
import SongConfigProvider from "@/components/config/SongConfig";
import ArrangementView, { ArrangementViewHandle } from "@/components/song/ArrangementView";
import SongMap from "@/components/song/SongMap";
import { ClientServiceUnit } from "@/prisma/models";
import { useTranslations } from "next-intl";
import React, { useEffect, useRef, useState } from "react";
import ServiceArrangementHeader from "./ServiceArrangementHeader";
import ServiceArrangementMeta from "./ServiceArrangementMeta";
import ServiceSongUnitEditForm, { EditFormHandle } from "./ServiceSongUnitEditForm";

type ServiceSongUnitViewProps = {
  unit: ClientServiceUnit;
  /** Elevado até o ServiceView — sobrevive à troca para o Modo Palco e volta. */
  transpose: number;
  onTransposeChange: (value: number) => void;
  // Achado em teste manual: "entrar no modo palco perde a edição e
  // descarta o que era feito" — o Modo Palco troca a árvore inteira (ver
  // ServiceView/index.tsx), desmontando este componente e qualquer edição
  // aberta nele sem avisar. Reporta "tem edição aberta COM alteração não
  // salva" (não só "está editando" — abrir e não mexer em nada não
  // precisa de aviso) pro ServiceView poder confirmar antes de trocar.
  onUnsavedEditChange?: (hasUnsavedEdit: boolean) => void;
};

export default function ServiceSongUnitView({
  unit,
  transpose,
  onTransposeChange,
  onUnsavedEditChange,
}: ServiceSongUnitViewProps) {
  const arrangement = unit.arrangement;
  const t = useTranslations("ServiceView");
  const { columns, fontSize, mode, density } = useServiceConfig();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const submitRef = useRef<EditFormHandle | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isHeaderStuck, setIsHeaderStuck] = useState(false);
  const viewRef = useRef<ArrangementViewHandle>(null);
  // Ao grudar no topo o cabeçalho encolhe (título e chips menores). Se a altura do fluxo mudasse junto,
  // o conteúdo pularia e o navegador (scroll anchoring) compensaria a rolagem, o cabeçalho
  // desgrudaria, cresceria... e ficaria piscando. Então a altura "parado" é lembrada e um
  // espaçador (abaixo) preenche a diferença: o fluxo não muda, só o cabeçalho (que é sticky).
  const naturalHeaderHeightRef = useRef(0);
  const lastStuckToggleRef = useRef(0);
  const isHeaderStuckRef = useRef(false);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const update = () => {
      const height = el.offsetHeight;
      // Só vale como altura "parado" quando está parado e a transição já acabou (200ms + folga).
      if (!isHeaderStuckRef.current && performance.now() - lastStuckToggleRef.current > 300) {
        naturalHeaderHeightRef.current = height;
      }
      setHeaderHeight(height);
    };
    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const stuck = entry.intersectionRatio < 1;
        if (stuck !== isHeaderStuckRef.current) {
          isHeaderStuckRef.current = stuck;
          lastStuckToggleRef.current = performance.now();
        }
        setIsHeaderStuck(stuck);
      },
      { threshold: 1, rootMargin: "-1px 0px 0px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const onUnsavedEditChangeRef = useRef(onUnsavedEditChange);
  onUnsavedEditChangeRef.current = onUnsavedEditChange;
  useEffect(() => {
    onUnsavedEditChangeRef.current?.(isEditing && isDirty);
    // Ao desmontar (ex.: a música some da lista), garante que o ServiceView
    // não continue achando que esta música tem edição pendente.
    return () => onUnsavedEditChangeRef.current?.(false);
  }, [isEditing, isDirty]);

  if (!arrangement) {
    throw new Error("Arrangement is not available for this unit");
  }

  // D11: o X só confirma com ConfirmDiscardDialog quando há alteração —
  // isDirty reseta junto, senão a próxima edição começaria "suja" por
  // engano (mesmo bug que faria o X pedir confirmação à toa logo de cara).
  function handleStartEdit() {
    setIsDirty(false);
    setIsEditing(true);
  }
  function handleCancel() {
    setIsDirty(false);
    setIsEditing(false);
  }
  function handleSaved() {
    setIsDirty(false);
    setIsEditing(false);
  }

  const units = arrangement.units ?? [];
  // Vão vertical entre blocos da cifra (--block-gap de ArrangementView: 1em / 0.5em compacto, na
  // fonte da cifra). O cabeçalho usa ele pra separar título, mapa e cifra.
  const blockGapPx = (density === "compact" ? 0.5 : 1) * fontSize;
  const handleSelectUnit = (index: number) => viewRef.current?.selectUnit(index);

  return (
    <div className="w-full" style={{ "--song-header-h": `${headerHeight}px` } as React.CSSProperties}>
      <SongConfigProvider
        transpose={transpose}
        onTransposeChange={onTransposeChange}
        columns={columns}
        fontSize={fontSize}
        mode={mode}
        density={density}
      >
        <ServiceArrangementHeader
          ref={headerRef}
          arrangement={arrangement}
          order={unit.order}
          isStuck={isHeaderStuck}
          // Mapa sempre no cabeçalho, logo abaixo do título, tocável: normal parado e pequeno
          // (como no Modo Palco) quando preso no topo. Na edição some: o editor tem o próprio
          // mapa, com o rascunho.
          mapUnits={!isEditing && units.length > 0 ? units : undefined}
          onSelectMapUnit={handleSelectUnit}
          blockGapPx={blockGapPx}
          isEditing={isEditing}
          isSaving={isSaving}
          isDirty={isDirty}
          onStartEdit={handleStartEdit}
          onCancel={handleCancel}
          onSaveServiceOnly={() => submitRef.current?.submit("service")}
          onSaveBoth={() => submitRef.current?.submit("both")}
        />
        {/* Espaçador: completa a altura que o cabeçalho "perde" ao grudar, pro fluxo não mudar. */}
        <div aria-hidden style={{ height: Math.max(0, naturalHeaderHeightRef.current - headerHeight) }} />
        <ServiceArrangementMeta
          arrangement={arrangement}
          isEditing={isEditing}
          isSaving={isSaving}
          isDirty={isDirty}
          onStartEdit={handleStartEdit}
          onCancel={handleCancel}
          onSaveServiceOnly={() => submitRef.current?.submit("service")}
          onSaveBoth={() => submitRef.current?.submit("both")}
        />
        {/* O vão entre o cabeçalho e o conteúdo (cifra ou editor) é o padding do próprio cabeçalho: o
            mesmo vão entre blocos na visualização e na edição. */}
        <div>
          {isEditing ? (
            <ServiceSongUnitEditForm
              unit={unit}
              submitRef={submitRef}
              onSavingChange={setIsSaving}
              onDirtyChange={setIsDirty}
              onSaved={handleSaved}
            />
          ) : (
            <ArrangementView
              ref={viewRef}
              arrangement={arrangement}
              collapsible
              footer={
                arrangement.song?.artist ? (
                  <p className="text-sm text-muted-foreground">
                    {t("composerLabel", { name: arrangement.song.artist })}
                  </p>
                ) : undefined
              }
            />
          )}
        </div>
      </SongConfigProvider>
    </div>
  );
}
