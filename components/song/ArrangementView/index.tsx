"use client";

import SongMap from "@/components/song/SongMap";
import { useSongConfig } from "@/components/config/SongConfig";
import { ClientArrangement } from "@/prisma/models";
import { ReactNode, useRef } from "react";
import ColumnViewer from "./ColumnViewer";
import Skeleton from "./Skeleton";

type ArrangementViewProps = {
  arrangement: ClientArrangement | null;
  /** Repassado pra ColumnViewer — renderiza dentro da última coluna, depois do último bloco. */
  footer?: ReactNode;
  // Mapa da música (seção 8.2/9.9 das specs — "espelho das repetições
  // existentes nos blocos", achado em teste manual). Opcional: contextos
  // menores que reaproveitam ArrangementView como preview (ArrangementPicker,
  // ServicePlanEditor/SongFlow) não pedem o mapa, só a tela de leitura de
  // verdade (catálogo e liturgia) e o Modo Palco (que usa sua própria cópia,
  // ver StageMode/index.tsx).
  showMap?: boolean;
};
export default function ArrangementView({ arrangement, footer, showMap = false }: ArrangementViewProps) {
  const { density, fontSize, columns, transpose, mode, enharmonicPreference } = useSongConfig();
  const unitRefs = useRef<(HTMLElement | null)[]>([]);

  if (!arrangement) {
    return <Skeleton density={density} />;
  }

  const isCompact = density === "compact";

  // Rola até o bloco tocado no mapa + destaque breve (scroll-target-flash,
  // já com prefers-reduced-motion tratado em globals.css).
  // scroll-margin-top (não cálculo manual de offset): deixa o CSS resolver
  // o desconto do cabeçalho sticky — cada tela já expõe a própria altura
  // via --song-header-h quando tem uma (ver ServiceSongUnitView.tsx);
  // onde não existe, a variável simplesmente não aplica desconto nenhum.
  function handleSelectUnit(index: number) {
    const el = unitRefs.current[index];
    if (!el) return;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" });
    el.classList.remove("scroll-target-flash");
    // Força reflow pra poder reiniciar a animação se o mesmo bloco for tocado de novo.
    void el.offsetWidth;
    el.classList.add("scroll-target-flash");
  }

  return (
    <div
      style={{
        fontSize: `${fontSize}px`,
        "--block-gap": isCompact ? "0.5em" : "1em",
        "--block-px":  isCompact ? "0.5em" : "1em",
        "--block-pt":  isCompact ? "0.25em" : "0.5em",
        "--item-mb":   isCompact ? "0.375em" : "0.5em",
      } as React.CSSProperties}
    >
      {showMap && (
        <SongMap
          units={arrangement.units!}
          onSelectUnit={handleSelectUnit}
          className="mt-[1.5em] mb-[var(--block-gap)]"
        />
      )}
      <ColumnViewer
        columns={columns}
        songUnits={arrangement.units!}
        transpose={transpose}
        originalKey={arrangement.key}
        enharmonicPreference={enharmonicPreference}
        mode={mode}
        density={density}
        footer={footer}
        onUnitRef={showMap ? (index, el) => { unitRefs.current[index] = el; } : undefined}
      />
    </div>
  );
}
