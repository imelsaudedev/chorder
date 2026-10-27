import { useServiceConfig } from "@/components/config/ServiceConfig";
import SongConfigProvider from "@/components/config/SongConfig";
import ArrangementView from "@/components/song/ArrangementView";
import { ClientServiceUnit } from "@/prisma/models";
import React, { useEffect, useRef, useState } from "react";
import ServiceArrangementHeader from "./ServiceArrangementHeader";
import ServiceMediaReferences from "./ServiceMediaReferences";
import ServiceSongUnitEditForm, { EditFormHandle } from "./ServiceSongUnitEditForm";

type ServiceSongUnitViewProps = {
  unit: ClientServiceUnit;
  /** Elevado até o ServiceView — sobrevive à troca para o Modo Palco e volta. */
  transpose: number;
  onTransposeChange: (value: number) => void;
};

export default function ServiceSongUnitView({ unit, transpose, onTransposeChange }: ServiceSongUnitViewProps) {
  const arrangement = unit.arrangement;
  const { columns, fontSize, mode, density } = useServiceConfig();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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
          isEditing={isEditing}
          isSaving={isSaving}
          isStuck={isHeaderStuck}
          onStartEdit={() => setIsEditing(true)}
          onCancel={() => setIsEditing(false)}
          onSaveServiceOnly={() => submitRef.current?.submit("service")}
          onSaveBoth={() => submitRef.current?.submit("both")}
        />
        {/* Referências de vídeo/áudio: ao vivo no original, independente do modo de edição de cifra */}
        {arrangement.originalArrangementId && (
          <ServiceMediaReferences
            originalArrangementId={arrangement.originalArrangementId}
            youtubeUrl={arrangement.youtubeUrl ?? null}
            audios={arrangement.audios ?? []}
            title={arrangement.song?.title}
          />
        )}
        {isEditing ? (
          <ServiceSongUnitEditForm
            unit={unit}
            submitRef={submitRef}
            onSavingChange={setIsSaving}
            onSaved={() => setIsEditing(false)}
          />
        ) : (
          <ArrangementView arrangement={arrangement} />
        )}
      </SongConfigProvider>
    </div>
  );
}
