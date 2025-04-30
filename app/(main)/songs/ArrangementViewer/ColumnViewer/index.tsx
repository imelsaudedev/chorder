import ChordProLine from "@components/ChordProLine";
import { Mode } from "@components/ModeButtonSet";
import { useEffect, useMemo, useState } from "react";
import { unitTypeColorClasses } from "@components/unit-colors";
import { findBestDistribution } from "./column-logic";
import { useMediaQuery } from "@hooks/useMediaQuery";
import { SongUnit } from "@/prisma/models";
import { Density } from "../ArrangementViewContext";
import { useTranslations } from "next-intl";

type ColumnViewerProps = {
  columns: number;
  songUnits: SongUnit[];
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
  const [columns, setColumns] = useState(columnConfig);

  const columnData = useMemo(
    () => findBestDistribution(songUnits, columns),
    [songUnits, columns]
  );

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

  const gridCols =
    mode === "text"
      ? "grid-cols-1"
      : columns === 2
      ? "grid-cols-2"
      : columns === 3
      ? "grid-cols-3"
      : columns >= 4
      ? "grid-cols-4"
      : "grid-cols-1";

  const isTextMode = mode === "text";

  return (
    <div
      className={`grid ${gridCols} ${
        density === "compact" ? "gap-2" : "gap-4"
      }`}
    >
      {columnData.map((data, idx) => (
        <div
          key={`col-${idx}`}
          className={`flex flex-col ${
            density === "compact" ? "gap-2" : "gap-4"
          }`}
        >
          {data.map((unit, unitIdx) => {
            const unitClasses = unitTypeColorClasses[unit.unitType];

            let className = `border rounded ${unitClasses.background} ${unitClasses.border} pb-2`;
            if (isTextMode) {
              className = `border-t ${unitClasses.background} ${unitClasses.border} bg-transparent mb-4`;
            }

            return (
              <div key={`unit-${unitIdx}`} className={className}>
                <div
                  className={`text-xs uppercase tracking-wide ${
                    unitClasses.text
                  } ${
                    mode === "text"
                      ? "px-0 py-2 text-left text-base font-normal"
                      : density === "compact"
                      ? "px-2 pt-1 pb-1"
                      : "px-4 pt-2 pb-1"
                  }`}
                >
                  {t(unit.unitType)}
                </div>

                {unit.lines.map((line, idx) => (
                  <ChordProLine
                    key={`unit-${unitIdx}-line-${idx}`}
                    line={line}
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
