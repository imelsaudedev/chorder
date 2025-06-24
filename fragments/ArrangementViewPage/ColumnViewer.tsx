import ChordProLine from "@/components-old/ChordProLine";
import { Mode } from "@/components-old/ModeButtonSet";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { SongUnit } from "@/models/song-unit";
import { useEffect, useMemo, useState } from "react";
import { findBestDistribution } from "./column-logic";
import { unitTypeColorClasses } from "@/components-old/unit-colors";

type ColumnViewerProps = {
  columns: number;
  songUnitMap: SongUnit[];
  transpose: number;
  originalKey?: string;
  mode: Mode;
  density: "compact" | "normal";
};

// Defina o tipo dos tipos de unidade
type UnitType = keyof typeof unitTypeColorClasses;

// Objeto de tradução para os tipos de unidade
const unitTypeTranslations: Record<UnitType, string> = {
  INTRO: "Intro",
  ENDING: "Saída",
  VERSE: "Verso",
  PRECHORUS: "Pré-Refrão",
  CHORUS: "Refrão",
  BRIDGE: "Ponte",
  INTERLUDE: "Interlúdio",
  SOLO: "Solo",
  BLOCK: "Bloco",
};

export default function ColumnViewer({
  columns: columnConfig,
  songUnitMap,
  transpose,
  originalKey,
  mode,
  density,
}: ColumnViewerProps) {
  const [columns, setColumns] = useState(columnConfig);

  const columnData = useMemo(
    () => findBestDistribution(songUnitMap, columns),
    [songUnitMap, columns]
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
                  {unitTypeTranslations[unit.unitType]}
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
