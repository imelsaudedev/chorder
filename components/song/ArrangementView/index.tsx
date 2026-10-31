"use client";

import { useSongConfig } from "@/components/config/SongConfig";
import { ClientArrangement } from "@/prisma/models";
import { forwardRef, ReactNode, useImperativeHandle, useRef } from "react";
import ColumnViewer from "./ColumnViewer";
import Skeleton from "./Skeleton";

type ArrangementViewProps = {
  arrangement: ClientArrangement | null;
  /** Repassado pra ColumnViewer — renderiza dentro da última coluna, depois do último bloco. */
  footer?: ReactNode;
};

/** Ações expostas via ref — o mapa da música vive FORA daqui (pode haver mais de uma cópia, ex.: inline + cabeçalho fixo) e aciona a mesma rolagem. */
export type ArrangementViewHandle = {
  /** Rola até o bloco `index` (ordem global dos blocos) e o destaca brevemente. */
  selectUnit: (index: number) => void;
};

const ArrangementView = forwardRef<ArrangementViewHandle, ArrangementViewProps>(function ArrangementView(
  { arrangement, footer },
  ref,
) {
  const { density, fontSize, columns, transpose, mode, enharmonicPreference } = useSongConfig();
  const unitRefs = useRef<(HTMLElement | null)[]>([]);

  // Rola até o bloco tocado no mapa + destaque breve (scroll-target-flash,
  // já com prefers-reduced-motion tratado em globals.css).
  // scroll-margin-top (não cálculo manual de offset): deixa o CSS resolver
  // o desconto do cabeçalho sticky — cada tela já expõe a própria altura
  // via --song-header-h quando tem uma (ver ServiceSongUnitView.tsx);
  // onde não existe, a variável simplesmente não aplica desconto nenhum.
  function selectUnit(index: number) {
    const el = unitRefs.current[index];
    if (!el) return;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" });
    el.classList.remove("scroll-target-flash");
    // Força reflow pra poder reiniciar a animação se o mesmo bloco for tocado de novo.
    void el.offsetWidth;
    el.classList.add("scroll-target-flash");
  }

  useImperativeHandle(ref, () => ({ selectUnit }), []);

  if (!arrangement) {
    return <Skeleton density={density} />;
  }

  const isCompact = density === "compact";

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
      <ColumnViewer
        columns={columns}
        songUnits={arrangement.units!}
        transpose={transpose}
        originalKey={arrangement.key}
        enharmonicPreference={enharmonicPreference}
        mode={mode}
        density={density}
        footer={footer}
        onUnitRef={(index, el) => { unitRefs.current[index] = el; }}
      />
    </div>
  );
});

export default ArrangementView;
