import { useServiceConfig } from "@/components/config/ServiceConfig";
import SongConfigProvider from "@/components/config/SongConfig";
import ArrangementView, { ArrangementViewHandle } from "@/components/song/ArrangementView";
import SongMap from "@/components/song/SongMap";
import { ClientServiceUnit } from "@/prisma/models";
import { useTranslations } from "next-intl";
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { songDisplayTitle } from "@/components/service/ServicePlanEditor/unitSummary";
import ServiceArrangementHeader from "./ServiceArrangementHeader";
import ServiceArrangementMeta from "./ServiceArrangementMeta";
import ServiceSongUnitEditForm, { EditFormHandle } from "./ServiceSongUnitEditForm";

// useLayoutEffect avisa quando renderiza no servidor (React 18); lá, useEffect (não roda) basta.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

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

  // --- Cabeçalho fixo (sticky) ---------------------------------------------------------------
  // "Preso" = esta música JÁ passou do topo da tela. Detectado por um marcador de 1px logo antes do
  // cabeçalho: quando ele sai da tela POR CIMA, o cabeçalho está grudado. (Antes olhava se o próprio
  // cabeçalho estava parcialmente visível, o que também vale para uma música que está só entrando
  // pela parte de baixo da tela — ela encolhia sem ter chegado ao topo.)
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsHeaderStuck(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Preso, o cabeçalho encolhe (título e chips menores). Se a altura do fluxo encolhesse junto, o
  // conteúdo pularia e o navegador (scroll anchoring) compensaria a rolagem, o que desgrudaria e
  // faria crescer de novo... em ciclo. Então guarda-se a altura "parado" e um espaçador logo
  // abaixo do cabeçalho preenche a diferença: a altura do fluxo não muda, só a do cabeçalho
  // (que é sticky e sobrepõe o conteúdo). O espaçador é ajustado direto no DOM, antes de pintar.
  const spacerRef = useRef<HTMLDivElement>(null);
  const naturalHeaderHeightRef = useRef(0);
  const isHeaderStuckRef = useRef(false);
  isHeaderStuckRef.current = isHeaderStuck;
  const measureHeader = useCallback(() => {
    const header = headerRef.current;
    if (!header) return;
    const height = header.offsetHeight;
    if (!isHeaderStuckRef.current) naturalHeaderHeightRef.current = height;
    if (spacerRef.current) {
      spacerRef.current.style.height = `${Math.max(0, naturalHeaderHeightRef.current - height)}px`;
    }
    // Altura atual (preso ou não): --song-header-h, usada pelo scroll-margin dos blocos.
    setHeaderHeight(height);
  }, []);
  // A cada render (barato; setHeaderHeight com o mesmo valor não re-renderiza), e quando o
  // tamanho muda sem render (girar o aparelho, redimensionar a janela, carregar fonte).
  useIsomorphicLayoutEffect(() => {
    measureHeader();
  });
  useEffect(() => {
    const el = headerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measureHeader);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measureHeader]);

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
        {/* Marcador: sai da tela por cima exatamente quando o cabeçalho (sticky) gruda. */}
        <div ref={sentinelRef} aria-hidden className="pointer-events-none -mb-px h-px" />
        <ServiceArrangementHeader
          ref={headerRef}
          arrangement={arrangement}
          title={songDisplayTitle(unit)}
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
          mobileControls={
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
          }
        />
        {/* Espaçador: completa a altura que o cabeçalho "perde" ao grudar, pro fluxo não mudar.
            Sem `style`: a altura é ajustada direto no DOM (measureHeader), antes de pintar. */}
        <div ref={spacerRef} aria-hidden />
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
