import { parseChordPro } from "@/chopro/music";
import { SongUnit, SongUnitType } from "@/prisma/models";
import { Line } from "chordsheetjs";

type UnitData = {
  lines: Line[];
  unitType: SongUnitType;
};

export function findBestDistribution(songUnitMap: SongUnit[], columns: number) {
  const unitData: UnitData[] = songUnitMap.map((unit) => {
    const chordproHtml = parseChordPro(unit.content);
    return {
      lines: chordproHtml.lines,
      unitType: unit.type,
    };
  });

  const { columnData } = findBestDistributionRec(unitData, columns);
  return columnData;
}

function getTotalHeight(columnData: UnitData[]) {
  return columnData
    .map((unit) =>
      unit.lines
        .map((line) => {
          const hasLyrics = line.items.some((item) =>
            (item as any).lyrics?.trim()
          );
          const hasChords = line.items.some((item) =>
            (item as any).chords?.trim()
          );
          let totalLines = 0;
          if (hasLyrics) {
            totalLines++;
          }
          if (hasChords) {
            totalLines++;
          }
          return totalLines;
        })
        .reduce((a, b) => a + b, 0)
    )
    .reduce((a, b) => a + b, 0);
}

function computeLeftSkewness(heights: number[]) {
  const half = Math.ceil(heights.length / 2);
  return heights.slice(0, half + 1).reduce((a, b) => a + b, 0);
}

function findBestDistributionRec(unitData: UnitData[], columns: number) {
  if (columns === 1) {
    return {
      columnData: [unitData],
      columnHeights: [getTotalHeight(unitData)],
    };
  }

  if (columns >= unitData.length) {
    const columnData = unitData.map((unit) => [unit]);
    const columnHeights = columnData.map((col) => getTotalHeight(col));
    return { columnData, columnHeights };
  }

  let bestHeightDifference = Infinity;
  let bestColumnData: UnitData[][] = [];
  let bestHeights: number[] = [];

  for (let i = 1; i < unitData.length; i++) {
    const left = unitData.slice(0, i);
    const right = unitData.slice(i);
    const leftHeight = getTotalHeight(left);
    const { columnData: rightColumns, columnHeights: rightColumnHeights } =
      findBestDistributionRec(right, columns - 1);

    const heights = [leftHeight, ...rightColumnHeights];
    const maxHeight = Math.max(...heights);
    const minHeight = Math.min(...heights);
    const heightDifference = maxHeight - minHeight;

    // Permitir que a última coluna seja um pouco menor sem penalizar a distribuição
    const lastColumnIsShorter =
      rightColumnHeights.length > 1 &&
      rightColumnHeights[rightColumnHeights.length - 1] < minHeight * 1.2;

    if (
      heightDifference < bestHeightDifference ||
      (lastColumnIsShorter && heightDifference <= bestHeightDifference + 2) ||
      (heightDifference === bestHeightDifference &&
        computeLeftSkewness(heights) > computeLeftSkewness(bestHeights))
    ) {
      bestHeightDifference = heightDifference;
      bestColumnData = [left, ...rightColumns];
      bestHeights = heights;
    }
  }

  return { columnData: bestColumnData, columnHeights: bestHeights };
}
