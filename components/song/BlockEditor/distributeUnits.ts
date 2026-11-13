import { parseChordPro } from "@/chopro/music";
import { findBestDistribution } from "@/components/song/ArrangementView/ColumnViewer/column-logic";
import { ClientSongUnit } from "@/prisma/models";

export type PositionedUnit = { unit: ClientSongUnit; index: number };

// Mesmo tratamento de linhas que `findBestDistribution` aplica antes de ler o ChordPro.
const trimLines = (content: string) =>
  content
    .split("\n")
    .map((line) => line.trim())
    .join("\n");

function parses(content: string): boolean {
  try {
    parseChordPro(trimLines(content));
    return true;
  } catch {
    return false;
  }
}

/**
 * Enquanto a pessoa digita no modo texto o conteúdo passa por estados que não são ChordPro
 * válido (um "[" aberto, por exemplo) e o leitor lança erro. `findBestDistribution` só usa o
 * bloco para contar linhas, então um bloco incompleto entra com os marcadores soltos removidos
 * (ou, no pior caso, uma linha neutra por linha), sem alterar a quantidade de linhas.
 */
function safeForLayout(unit: ClientSongUnit): ClientSongUnit {
  if (unit.type === "TEXT" || parses(unit.content)) return unit;
  const stripped = unit.content.replace(/[[\]{}\\]/g, "");
  if (parses(stripped)) return { ...unit, content: stripped };
  return { ...unit, content: unit.content.split("\n").map(() => "x").join("\n") };
}

/**
 * Agrupa os blocos em colunas reusando `findBestDistribution` sem alterá-lo
 * (regra de ouro + D2: colunas sempre dinâmicas, iguais às da leitura).
 * `findBestDistribution` só corta a lista em faixas contíguas — nunca
 * reordena nem intercala (ver `findBestDistributionRec`: cada chamada separa
 * um prefixo de um sufixo com `slice`) — então o comprimento de cada coluna
 * que ele devolve é suficiente para recortar a mesma faixa da lista real de
 * unidades, sem precisar casar objeto a objeto com o que ele retorna. Isso
 * preserva o índice original de cada unidade, necessário pras ações do menu
 * (Subir/Descer/Duplicar/Apagar) mexerem no array certo independente da
 * coluna em que o bloco aparece visualmente.
 */
export function distributeUnitsIntoColumns(
  units: ClientSongUnit[],
  columns: number
): PositionedUnit[][] {
  if (units.length === 0) return [];

  const columnData = findBestDistribution(units.map(safeForLayout), columns);
  const result: PositionedUnit[][] = [];
  let offset = 0;
  for (const column of columnData) {
    const slice = units
      .slice(offset, offset + column.length)
      .map((unit, i) => ({ unit, index: offset + i }));
    result.push(slice);
    offset += column.length;
  }
  return result;
}
