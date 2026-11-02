import { parseChordPro } from "@/chopro/music";
import { ClientSongUnit, SongUnitType } from "@/prisma/models";
import { Line } from "chordsheetjs";

type UnitData = {
  lines: Line[];
  unitType: SongUnitType;
  unitTypeIndex: number;
  content?: string;
  notes?: string | null;
  repeatCount?: number;
};

export function findBestDistribution(
  songUnitMap: ClientSongUnit[],
  columns: number
) {
  const unitTypeIndices: Record<string, number> = {};
  const unitData: UnitData[] = songUnitMap.map((unit) => {
    unitTypeIndices[unit.type] = (unitTypeIndices[unit.type] || 0) + 1;

    if (unit.type === "TEXT") {
      return {
        lines: [],
        unitType: unit.type,
        unitTypeIndex: unitTypeIndices[unit.type],
        content: unit.content,
        notes: unit.notes,
        repeatCount: unit.repeatCount ?? 1,
      };
    }

    const content = unit.content
      .split("\n")
      .map((line) => line.trim())
      .join("\n");
    const chordproHtml = parseChordPro(content);
    return {
      lines: chordproHtml.lines,
      unitType: unit.type,
      unitTypeIndex: unitTypeIndices[unit.type],
      notes: unit.notes,
      repeatCount: unit.repeatCount ?? 1,
    };
  });

  const { columnData } = findBestDistributionRec(unitData, columns);
  return columnData;
}

// Custo fixo de cada bloco, em "linhas de texto", além das linhas do conteúdo:
// cabeçalho do bloco (~1 linha) + padding vertical (~1) + o espaço entre blocos
// (~1, --block-gap). Estimativa a partir das classes do ColumnViewer — sem ela,
// uma coluna com muitos blocos curtos parecia bem menor do que realmente fica
// (cada bloco custa cerca de 2,5 linhas a mais) e as colunas saíam desiguais.
const BLOCK_OVERHEAD_LINES = 2.5;
// Bloco de texto livre (TEXT) não tem cabeçalho nem borda: só o espaço entre blocos.
const TEXT_BLOCK_OVERHEAD_LINES = 1;

function getUnitHeight(unit: UnitData): number {
  if (unit.unitType === "TEXT") {
    const textLines = (unit.content || "").split("\n").length;
    return textLines + 1 + TEXT_BLOCK_OVERHEAD_LINES;
  }
  const contentLines = unit.lines
    .map((line) => {
      const hasLyrics = line.items.some((item) => (item as any).lyrics?.trim());
      const hasChords = line.items.some((item) => (item as any).chords?.trim());
      let totalLines = 0;
      if (hasLyrics) {
        totalLines++;
      }
      if (hasChords) {
        totalLines++;
      }
      return totalLines;
    })
    .reduce((a, b) => a + b, 0);
  return contentLines + BLOCK_OVERHEAD_LINES;
}

function getTotalHeight(columnData: UnitData[]) {
  return columnData.map(getUnitHeight).reduce((a, b) => a + b, 0);
}

// Corta a lista de blocos (sem reordenar) em `columns` faixas contíguas,
// minimizando a altura da coluna MAIS ALTA — é ela que define quanto da tela a
// música ocupa. Entre partições com a mesma coluna mais alta, fica a que tem a
// coluna mais baixa maior (colunas mais parecidas) e, persistindo o empate, a
// última coluna um pouco menor. Programação dinâmica (O(n²·colunas)), exata
// para o critério principal.
function findBestDistributionRec(unitData: UnitData[], columns: number) {
  const n = unitData.length;

  if (columns <= 1) {
    return {
      columnData: [unitData],
      columnHeights: [getTotalHeight(unitData)],
    };
  }

  if (columns >= n) {
    const columnData = unitData.map((unit) => [unit]);
    const columnHeights = columnData.map((col) => getTotalHeight(col));
    return { columnData, columnHeights };
  }

  const prefix = [0];
  unitData.forEach((unit) => prefix.push(prefix[prefix.length - 1] + getUnitHeight(unit)));

  type Cell = { max: number; min: number; split: number };
  // best[c][j]: melhor corte dos j primeiros blocos em c colunas.
  const best: (Cell | null)[][] = Array.from({ length: columns + 1 }, () => Array(n + 1).fill(null));
  for (let j = 1; j <= n; j++) {
    best[1][j] = { max: prefix[j], min: prefix[j], split: 0 };
  }
  const EPS = 1e-9;
  for (let c = 2; c <= columns; c++) {
    for (let j = c; j <= n; j++) {
      // i decrescente: no empate total, a última coluna (i..j) fica menor.
      for (let i = j - 1; i >= c - 1; i--) {
        const prev = best[c - 1][i];
        if (!prev) continue;
        const segment = prefix[j] - prefix[i];
        const max = Math.max(prev.max, segment);
        const min = Math.min(prev.min, segment);
        const cell = best[c][j];
        if (!cell || max < cell.max - EPS || (Math.abs(max - cell.max) <= EPS && min > cell.min + EPS)) {
          best[c][j] = { max, min, split: i };
        }
      }
    }
  }

  const columnData: UnitData[][] = [];
  const columnHeights: number[] = [];
  let end = n;
  for (let c = columns; c >= 1; c--) {
    const split = best[c][end]?.split ?? 0;
    columnData.unshift(unitData.slice(split, end));
    columnHeights.unshift(prefix[end] - prefix[split]);
    end = split;
  }
  return { columnData, columnHeights };
}
