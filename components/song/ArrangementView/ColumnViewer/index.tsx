import { ChordProItem } from "@/chopro/music";
import { Density, Mode } from "@/components/config/config";
import ChordProLine from "@/components/song/ChordProLine";
import { unitColorClasses } from "@/components/song/unit-colors";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { ClientSongUnit } from "@/prisma/models";
import clsx from "clsx";
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
  const isCompact = density === "compact";

  return (
    <div
      className={clsx("grid", gridColsClass, {
        "gap-2": isCompact,
        "gap-4": !isCompact,
      })}
    >
      {columnData.map((data, idx) => (
        <div
          key={`col-${idx}`}
          className={clsx("flex flex-col", {
            "gap-2": isCompact,
            "gap-4": !isCompact,
          })}
        >
          {data.map((unit, unitIdx) => {
            const unitClasses = unitColorClasses[unit.unitType];
            return (
              <div
                key={`unit-${unitIdx}`}
                className={clsx(unitClasses.background, unitClasses.border, {
                  "border-t bg-transparent mb-4": isTextMode,
                  "border rounded pb-2": !isTextMode,
                })}
              >
                <div
                  className={clsx(
                    "text-xs uppercase tracking-wide select-none",
                    unitClasses.text,
                    {
                      "px-0 py-2 text-left text-base font-normal": isTextMode,
                      "px-2 pt-1 pb-1": !isTextMode && isCompact,
                      "px-4 pt-2 pb-1": !isTextMode && !isCompact,
                    }
                  )}
                >
                  {t(unit.unitType)} {unit.unitTypeIndex}
                </div>

                {unit.lines.map((line, idx) => (
                  <ChordProLine
                    key={`unit-${unitIdx}-line-${idx}`}
                    items={line.items as ChordProItem[]}
                    originalKey={originalKey}
                    transpose={transpose}
                    mode={mode}
                    density={density}
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
