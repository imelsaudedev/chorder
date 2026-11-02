"use client";

import { DRAG_DATA_TYPE, isSongUnitDragData } from "@/components/song/BlockEditor/dragData";
import { unitColorClasses } from "@/components/song/unit-colors";
import { computeUnitTypeShortNumbers } from "@/components/song/unit-numbering";
import { SongUnitType } from "@/prisma/models";
import {
  attachClosestEdge,
  Edge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index";
import { DropIndicator } from "@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

export type SongMapUnit = { type: SongUnitType };

type SongMapProps = {
  // Espelho das repetições existentes nos blocos — um chip por unidade, na
  // ordem da música, SEM deduplicar (repetição já é bloco duplicado desde
  // D5: "cada repetição é um bloco de verdade, não um multiplicador" —
  // ANALISE.md §G). Dois Refrão viram dois chips "R1"/"R2", não um só.
  units: SongMapUnit[];
  // Rola até o bloco (seção 8.2/9.9 das specs) — quem chama decide COMO
  // (ColumnViewer e StageMode têm containers de rolagem diferentes), o
  // mapa só avisa qual índice foi tocado. Sem isso, os chips são só
  // informação (não viram botões).
  onSelectUnit?: (index: number) => void;
  // Reordenar pelo mapa (modo edição): arrastar um chip pra antes/depois de
  // outro move o bloco (mesmo mecanismo de arrastar do BlockEditor). Alt+←/→
  // com o chip focado faz o mesmo pelo teclado.
  onMoveUnit?: (fromIndex: number, toIndex: number) => void;
  // Variante menor pro mapa preso no topo da leitura.
  compact?: boolean;
  // Variante "tudo numa linha só" (cabeçalhos fixos): os chips encolhem juntos pra
  // caber todos, mesmo que a sigla fique pouco legível.
  fit?: boolean;
  className?: string;
};

// Mapa da música (seção 8.2.1 da spec de edição + 9.9 de referências de
// mídia): chips QUADRADOS com a sigla mínima de cada bloco, cor igual ao bloco
// correspondente (unit-colors.ts).
// - normal (leitura e edição): 32px, quebra em linhas — sem rolagem lateral (e
//   sem a rolagem vertical "escondida" que o overflow-x criava ao girar a roda
//   do mouse em cima do mapa). Cabem 10 por linha num celular: até 20 blocos em 2 linhas.
// - compact: 24px, também quebra em linhas.
// - fit (cabeçalho do Palco e da liturgia): uma linha, os chips encolhem juntos. Celular
//   e tablet usam a largura toda (teto 24/28px); no desktop (xl) a linha vira do
//   tamanho do conteúdo (chips de 32px), alinhada à direita pelo cabeçalho.
export default function SongMap({
  units,
  onSelectUnit,
  onMoveUnit,
  compact = false,
  fit = false,
  className,
}: SongMapProps) {
  const t = useTranslations();
  const numbers = computeUnitTypeShortNumbers(units.map((u) => u.type));

  if (units.length === 0) return null;

  const containerClasses = fit
    ? "flex w-full items-center gap-0.5 xl:w-auto xl:max-w-full xl:gap-1 xl:overflow-x-auto xl:overflow-y-hidden no-scrollbar"
    : `flex flex-wrap items-center ${compact ? "gap-0.5" : "gap-1"}`;

  return (
    <div role="group" aria-label={t("SongMap.label")} className={`${containerClasses} ${className || ""}`}>
      {units.map((unit, index) => {
        const colorClasses = unitColorClasses[unit.type];
        const number = numbers[index];
        const fullLabel = t(`UnitTypes.${unit.type}`) + (number ? ` ${number}` : "");
        return (
          <Chip
            key={index}
            index={index}
            abbr={t(`UnitTypesShort.${unit.type}`) + (number ?? "")}
            fullLabel={fullLabel}
            // Na edição o chip convive com o botão de tipo do bloco, que já se chama "Verso 1":
            // nomes diferentes pra leitor de tela (e pra não haver dois botões iguais).
            ariaLabel={onMoveUnit ? `${t("SongMap.goTo")} ${fullLabel}` : fullLabel}
            colors={`${colorClasses.border} ${colorClasses.background} ${colorClasses.text}`}
            compact={compact}
            fit={fit}
            onSelect={onSelectUnit}
            onMove={onMoveUnit}
          />
        );
      })}
    </div>
  );
}

type ChipProps = {
  index: number;
  abbr: string;
  fullLabel: string;
  ariaLabel: string;
  colors: string;
  compact: boolean;
  fit: boolean;
  onSelect?: (index: number) => void;
  onMove?: (fromIndex: number, toIndex: number) => void;
};

function Chip({ index, abbr, fullLabel, ariaLabel, colors, compact, fit, onSelect, onMove }: ChipProps) {
  const ref = useRef<HTMLElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);
  const reorderable = !!onMove;

  // Reordenar: o chip é fonte de arrasto e alvo de soltar (borda esquerda/direita decide se
  // entra antes ou depois). Os dados são os mesmos do bloco (DRAG_DATA_TYPE), então arrastar um
  // chip até um bloco — ou um bloco até um chip — também funciona.
  useEffect(() => {
    const el = ref.current;
    if (!el || !onMove) return;
    const cleanupDrag = draggable({
      element: el,
      getInitialData: () => ({ type: DRAG_DATA_TYPE, index }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });
    const cleanupDrop = dropTargetForElements({
      element: el,
      canDrop: ({ source }) => isSongUnitDragData(source.data) && source.data.index !== index,
      getData: ({ input, element }) =>
        attachClosestEdge({ type: "song-map-chip", index }, { input, element, allowedEdges: ["left", "right"] }),
      onDragEnter: ({ self }) => setClosestEdge(extractClosestEdge(self.data)),
      onDrag: ({ self }) => setClosestEdge(extractClosestEdge(self.data)),
      onDragLeave: () => setClosestEdge(null),
      onDrop: ({ source, self }) => {
        setClosestEdge(null);
        if (!isSongUnitDragData(source.data)) return;
        onMove(
          source.data.index,
          getReorderDestinationIndex({
            startIndex: source.data.index,
            indexOfTarget: index,
            closestEdgeOfTarget: extractClosestEdge(self.data),
            axis: "horizontal",
          })
        );
      },
    });
    return () => {
      cleanupDrag();
      cleanupDrop();
    };
  }, [index, onMove]);

  const chipClasses = fit
    ? // Quadrado (aspect-square). Teto por largura de tela: celular 24px (encolhe junto se
      // houver muitos blocos), tablet 28px, desktop 32px (tamanho normal).
      `flex aspect-square min-w-0 max-w-6 flex-1 basis-0 items-center justify-center overflow-hidden whitespace-nowrap rounded-sm border text-[9px] font-semibold uppercase leading-none md:max-w-7 md:text-[10px] xl:size-8 xl:max-w-none xl:flex-none xl:basis-auto xl:rounded-md xl:text-xs ${colors}`
    : `shrink-0 inline-flex items-center justify-center border font-semibold uppercase tracking-wide transition-colors ${
        compact ? "size-6 rounded text-[11px]" : "size-8 rounded-md text-xs"
      } ${colors}`;

  const interactive = !!onSelect || reorderable;
  if (!interactive) {
    return (
      <span title={fullLabel} aria-label={ariaLabel} className={chipClasses}>
        {abbr}
      </span>
    );
  }

  // O desenho é pequeno (32px / 24px); o alvo de toque de verdade (≥44px) vem do
  // after: invisível, igual ao chip do editor — "a área de toque pode exceder o
  // desenho" (seção 8.8/8.2.1).
  const touch = compact || fit ? "after:-inset-2" : "after:-inset-1.5";
  const interactiveClasses = `relative p-0 hover:brightness-95 after:content-[''] after:absolute ${touch} ${
    reorderable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
  } ${isDragging ? "opacity-40" : ""}`;

  // Reordenável: span com role=button (não <button>) — o Firefox não deixa arrastar a partir de <button>.
  if (reorderable) {
    return (
      <span
        ref={ref}
        role="button"
        tabIndex={0}
        title={fullLabel}
        aria-label={ariaLabel}
        onClick={() => onSelect?.(index)}
        onKeyDown={(event) => {
          if (event.altKey && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
            event.preventDefault();
            onMove?.(index, event.key === "ArrowLeft" ? index - 1 : index + 1);
          } else if ((event.key === "Enter" || event.key === " ") && onSelect) {
            event.preventDefault();
            onSelect(index);
          }
        }}
        className={`${chipClasses} ${interactiveClasses}`}
      >
        {abbr}
        {closestEdge && <DropIndicator edge={closestEdge} gap="2px" />}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect?.(index)}
      aria-label={ariaLabel}
      title={fullLabel}
      className={`${chipClasses} ${interactiveClasses}`}
    >
      {abbr}
    </button>
  );
}
