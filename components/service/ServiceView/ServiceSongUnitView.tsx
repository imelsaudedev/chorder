import { useServiceConfig } from "@/components/config/ServiceConfig";
import SongConfigProvider from "@/components/config/SongConfig";
import ArrangementView from "@/components/song/ArrangementView";
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
};

export default function ServiceSongUnitView({ unit, transpose, onTransposeChange }: ServiceSongUnitViewProps) {
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
            <ArrangementView
              arrangement={arrangement}
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
