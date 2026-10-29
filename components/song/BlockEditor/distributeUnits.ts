import { findBestDistribution } from "@/components/song/ArrangementView/ColumnViewer/column-logic";
import { ClientSongUnit } from "@/prisma/models";

export type PositionedUnit = { unit: ClientSongUnit; index: number };

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

  const columnData = findBestDistribution(units, columns);
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
