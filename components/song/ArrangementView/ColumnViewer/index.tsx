import { ChordProItem } from "@/chopro/music";
import { MarkdownViewer } from "@/components/common/MarkdownViewer";
import { Density, Mode } from "@/components/config/config";
import ChordProLine from "@/components/song/ChordProLine";
import { unitColorClasses } from "@/components/song/unit-colors";
import { useResponsiveColumns } from "@/hooks/useResponsiveColumns";
import { ClientSongUnit } from "@/prisma/models";
import clsx from "clsx";
import { ChevronDown, ChevronRight, Repeat2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { findBestDistribution } from "./column-logic";

type ColumnViewerProps = {
  columns: number;
  songUnits: ClientSongUnit[];
  transpose: number;
  originalKey?: string;
  enharmonicPreference?: "sharp" | "flat" | null;
  mode: Mode;
  density: Density;
  /** Renderizado dentro da última coluna, depois do último bloco — não abaixo de todas as colunas. */
  footer?: ReactNode;
  // Mapa da música (SongMap): "tocar rola até o bloco" precisa de um
  // elemento de verdade por unidade pra rolar até ele — findBestDistribution
  // (column-logic.ts, regra de ouro: não alterar) só corta songUnits em
  // faixas contíguas, nunca reordena, então o índice GLOBAL de cada
  // unidade renderizada é só a posição corrida através das colunas (ver
  // offset abaixo) — não precisa de nenhum campo novo vindo de lá.
  onUnitRef?: (index: number, el: HTMLElement | null) => void;
  // Minimizar blocos ("esse eu já sei tocar"): com onToggleCollapse, cada bloco
  // ganha um botão no cabeçalho; os blocos em collapsedUnits (índice entre os
  // blocos) mostram só o cabeçalho. Controlado de fora pra valer entre telas e
  // sobreviver a remontar o viewer (ex.: trocar de número de colunas).
  collapsedUnits?: ReadonlySet<number>;
  onToggleCollapse?: (index: number) => void;
};

export default function ColumnViewer({
  columns: columnConfig,
  songUnits,
  transpose,
  originalKey,
  enharmonicPreference,
  mode,
  density,
  footer,
  onUnitRef,
  collapsedUnits,
  onToggleCollapse,
}: ColumnViewerProps) {
  const t = useTranslations("UnitTypes");
  const tBlocks = useTranslations("Blocks");
  // Bloco minimizado entra na distribuição das colunas sem conteúdo (só o
  // cabeçalho), pra elas se rebalancearem em vez de sobrar espaço onde ele estava.
  // findBestDistribution só conta as linhas, então basta esvaziar o conteúdo.
  const distributionUnits = useMemo(
    () =>
      collapsedUnits && collapsedUnits.size > 0
        ? songUnits.map((unit, index) =>
            collapsedUnits.has(index) && unit.type !== "TEXT" ? { ...unit, content: "" } : unit
          )
        : songUnits,
    [songUnits, collapsedUnits]
  );
  const { columns, columnData } = useColumnData(distributionUnits, columnConfig);
  const gridColsClass = getGridColumnClass(mode, columns);
  const isTextMode = mode === "text";
  let globalIndex = -1;

  return (
    <div
      className={clsx("grid", gridColsClass, "gap-[var(--block-gap)]")}
    >
      {columnData.map((data, idx) => (
        <div
          key={`col-${idx}`}
          className="flex flex-col gap-[var(--block-gap)]"
        >
          {data.map((unit, unitIdx) => {
            globalIndex += 1;
            const thisIndex = globalIndex;
            const isTextUnit = unit.unitType === "TEXT";
            const isCollapsed = !!collapsedUnits?.has(thisIndex);
            const unitClasses = unitColorClasses[unit.unitType];

            if (isTextUnit) {
              return (
                <div
                  key={`unit-${unitIdx}`}
                  ref={onUnitRef ? (el) => onUnitRef(thisIndex, el) : undefined}
                  className={clsx(
                    // scroll-mt: desconta a altura do cabeçalho sticky ao
                    // rolar até aqui pelo mapa da música — --song-header-h
                    // só existe onde há um cabeçalho sticky de verdade
                    // (ServiceSongUnitView.tsx); nos demais contextos o
                    // fallback 0px não desconta nada.
                    onUnitRef && "scroll-mt-[var(--song-header-h,0px)]",
                    {
                      "py-[0.5em]": isTextMode,
                      "bg-muted rounded-lg p-[1em]": !isTextMode,
                    }
                  )}
                >
                  <MarkdownViewer content={unit.content || ""} />
                </div>
              );
            }

            return (
              <div
                key={`unit-${unitIdx}`}
                ref={onUnitRef ? (el) => onUnitRef(thisIndex, el) : undefined}
                className={clsx(
                  unitClasses.background,
                  unitClasses.border,
                  onUnitRef && "scroll-mt-[var(--song-header-h,0px)]",
                  {
                    "border-t bg-transparent mb-[1em]": isTextMode,
                    "border rounded-lg pb-[0.5em]": !isTextMode,
                  }
                )}
              >
                <div
                  className={clsx(
                    "flex items-baseline gap-1 select-none",
                    unitClasses.text,
                    {
                      "px-0 py-[0.5em]": isTextMode,
                      "px-[var(--block-px)] pt-[var(--block-pt)] pb-[0.5em]": !isTextMode,
                    }
                  )}
                >
                  <span className={clsx("text-[0.75em] uppercase tracking-wide shrink-0", { "!text-[1em] font-normal": isTextMode })}>
                    {t(unit.unitType)} {unit.unitTypeIndex}
                  </span>
                  {unit.notes && (
                    <>
                      <span className="text-[0.75em] opacity-40 shrink-0">·</span>
                      <span className="text-[0.75em] italic font-normal normal-case tracking-normal">
                        {unit.notes}
                      </span>
                    </>
                  )}
                  {(unit.repeatCount ?? 1) > 1 && (
                    <span className={clsx(
                      "ml-auto inline-flex items-center gap-[0.2em] text-[0.7em] font-semibold px-[0.4em] py-[0.1em] rounded shrink-0",
                      unitClasses.repeatBadge
                    )}>
                      <Repeat2 size="1em" />
                      {unit.repeatCount}
                    </span>
                  )}
                  {onToggleCollapse && (
                    <button
                      type="button"
                      onClick={() => onToggleCollapse(thisIndex)}
                      aria-expanded={!isCollapsed}
                      aria-label={isCollapsed ? tBlocks("expand") : tBlocks("collapse")}
                      title={isCollapsed ? tBlocks("expand") : tBlocks("collapse")}
                      // self-center: o cabeçalho alinha pela linha de base do texto do título; o
                      // ícone fica centralizado na altura da linha. Área de toque maior que o
                      // ícone (padding com margem negativa: não engorda o cabeçalho).
                      className={clsx(
                        "-my-[0.4em] -mr-[0.3em] inline-flex shrink-0 cursor-pointer items-center justify-center self-center rounded p-[0.4em] leading-none opacity-60 hover:opacity-100",
                        (unit.repeatCount ?? 1) <= 1 && "ml-auto"
                      )}
                    >
                      {isCollapsed ? <ChevronRight size="0.9em" /> : <ChevronDown size="0.9em" />}
                    </button>
                  )}
                </div>

                {(isCollapsed ? [] : unit.lines).map((line, idx) => (
                  <ChordProLine
                    key={`unit-${unitIdx}-line-${idx}`}
                    items={line.items as ChordProItem[]}
                    originalKey={originalKey}
                    transpose={transpose}
                    enharmonicPreference={enharmonicPreference}
                    mode={mode}
                    density={density}
                    commentClass={unitClasses.comment}

                  />
                ))}
              </div>
            );
          })}
          {footer && idx === columnData.length - 1 && footer}
        </div>
      ))}
    </div>
  );
}

function getGridColumnClass(mode: string, columns: number) {
  return mode === "text"
    ? "grid-cols-1"
    : columns === 2
    ? "grid-cols-2"
    : columns === 3
    ? "grid-cols-3"
    : columns >= 4
    ? "grid-cols-4"
    : "grid-cols-1";
}

function useColumnData(songUnits: ClientSongUnit[], columnConfig: number) {
  // Resolução de "0 = automático" extraída pra hooks/useResponsiveColumns —
  // reaproveitada pelo editor por blocos, que precisa mostrar as MESMAS
  // colunas da leitura.
  const responsiveColumns = useResponsiveColumns(columnConfig);
  const [columns, setColumns] = useState(responsiveColumns);

  const columnData = useMemo(
    () => findBestDistribution(songUnits, columns),
    [songUnits, columns]
  );

  useEffect(() => {
    if (columnData.length !== columns) {
      setColumns(columnData.length);
    }
  }, [columnData.length, columns]);

  useEffect(() => {
    setColumns(responsiveColumns);
  }, [responsiveColumns]);

  return { columnData, columns, setColumns };
}
