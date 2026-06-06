import { ChordProItem } from "@/chopro/music";
import { MarkdownViewer } from "@/components/common/MarkdownViewer";
import { Density, Mode } from "@/components/config/config";
import ChordProLine from "@/components/song/ChordProLine";
import { unitColorClasses } from "@/components/song/unit-colors";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { ClientSongUnit } from "@/prisma/models";
import clsx from "clsx";
import { Repeat2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { findBestDistribution } from "./column-logic";

type ColumnViewerProps = {
  columns: number;
  songUnits: ClientSongUnit[];
  transpose: number;
  originalKey?: string;
  mode: Mode;
  density: Density;
};

export default function ColumnViewer({
  columns: columnConfig,
  songUnits,
  transpose,
  originalKey,
  mode,
  density,
}: ColumnViewerProps) {
  const t = useTranslations("UnitTypes");
  const { columns, columnData } = useColumnData(songUnits, columnConfig);
  const gridColsClass = getGridColumnClass(mode, columns);
  const isTextMode = mode === "text";

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
            const isTextUnit = unit.unitType === "TEXT";
            const unitClasses = unitColorClasses[unit.unitType];

            if (isTextUnit) {
              return (
                <div
                  key={`unit-${unitIdx}`}
                  className={clsx({
                    "py-[0.5em]": isTextMode,
                    "bg-gray-100 dark:bg-zinc-800 rounded p-[1em]": !isTextMode,
                  })}
                >
                  <MarkdownViewer content={unit.content || ""} />
                </div>
              );
            }

            return (
              <div
                key={`unit-${unitIdx}`}
                className={clsx(unitClasses.background, unitClasses.border, {
                  "border-t bg-transparent mb-[1em]": isTextMode,
                  "border rounded pb-[0.5em]": !isTextMode,
                })}
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
                </div>

                {unit.lines.map((line, idx) => (
                  <ChordProLine
                    key={`unit-${unitIdx}-line-${idx}`}
                    items={line.items as ChordProItem[]}
                    originalKey={originalKey}
                    transpose={transpose}
                    mode={mode}
                    density={density}
                    commentClass={unitClasses.comment}
                  />
                ))}
              </div>
            );
          })}
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
  const [columns, setColumns] = useState(columnConfig);

  const columnData = useMemo(
    () => findBestDistribution(songUnits, columns),
    [songUnits, columns]
  );

  useEffect(() => {
    if (columnData.length !== columns) {
      setColumns(columnData.length);
    }
  }, [columnData.length, columns]);

  const isPhone = useMediaQuery("(max-width: 639px)");
  const isTablet = useMediaQuery("(max-width: 1023px)");
  const isDesktop = useMediaQuery("(max-width: 1279px)");
  useEffect(() => {
    if (columnConfig === 0) {
      if (isPhone) {
        setColumns(1);
      } else if (isTablet) {
        setColumns(2);
      } else if (isDesktop) {
        setColumns(3);
      } else {
        setColumns(4);
      }
    } else {
      setColumns(columnConfig);
    }
  }, [columnConfig, isDesktop, isPhone, isTablet]);

  return { columnData, columns, setColumns };
}
