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
  const inlineMapRef = useRef<HTMLDivElement>(null);
  const [isInlineMapAbove, setIsInlineMapAbove] = useState(false);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHeaderHeight(el.offsetHeight));
    ro.observe(el);
    setHeaderHeight(el.offsetHeight);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsHeaderStuck(entry.intersectionRatio < 1),
      { threshold: 1, rootMargin: "-1px 0px 0px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Mapa inline saiu da tela POR CIMA (já passou, abaixo do cabeçalho fixo):
  // o mesmo slot do título passa a mostrar o mapa compacto. rootMargin
  // desconta a altura do cabeçalho, pra trocar só quando o mapa some de fato.
  useEffect(() => {
    const el = inlineMapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setIsInlineMapAbove(false);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) =>
        setIsInlineMapAbove(!entry.isIntersecting && entry.boundingClientRect.top < (entry.rootBounds?.top ?? 0) + 1),
      { threshold: 0, rootMargin: `-${headerHeight}px 0px 0px 0px` }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [headerHeight, isEditing, arrangement?.id]);

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
          titleSlot={
            !isEditing && isInlineMapAbove && units.length > 0 ? (
              <SongMap compact units={units} onSelectUnit={handleSelectUnit} className="w-full" />
            ) : undefined
          }
          isEditing={isEditing}
          isSaving={isSaving}
          isDirty={isDirty}
          onStartEdit={handleStartEdit}
          onCancel={handleCancel}
          onSaveServiceOnly={() => submitRef.current?.submit("service")}
          onSaveBoth={() => submitRef.current?.submit("both")}
        />
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
        <div className="mt-3 md:mt-4">
          {isEditing ? (
            <ServiceSongUnitEditForm
              unit={unit}
              submitRef={submitRef}
              onSavingChange={setIsSaving}
              onDirtyChange={setIsDirty}
              onSaved={handleSaved}
            />
          ) : (
            <>
              {units.length > 0 && (
                <div ref={inlineMapRef} className="mb-4">
                  <SongMap units={units} onSelectUnit={handleSelectUnit} />
                </div>
              )}
              <ArrangementView
                ref={viewRef}
                arrangement={arrangement}
                footer={
                  arrangement.song?.artist ? (
                    <p className="text-sm text-muted-foreground">
                      {t("composerLabel", { name: arrangement.song.artist })}
                    </p>
                  ) : undefined
                }
              />
            </>
          )}
        </div>
      </SongConfigProvider>
    </div>
  );
}
