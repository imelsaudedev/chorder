import { SongUnitType } from "@/prisma/models";

// Numeração do seletor de tipo do bloco (seção 8.2 da spec): "nome com
// numeração, igual à da leitura" — mesma regra incremental e incondicional
// de `unitTypeIndex` em column-logic.ts (ColumnViewer/index.tsx:87), só que
// calculada na ordem dos dados, não na distribuição em colunas, porque a
// regra de ouro da spec proíbe tocar em column-logic.ts. A numeração
// condicional ("só se houver mais de um") da seção 8.2.1 é só para as siglas
// do mapa/Modo Palco, que ficaram fora desta entrega (ver ANALISE.md §G).
export function computeUnitTypeNumbers(
  types: SongUnitType[]
): number[] {
  const counts: Partial<Record<SongUnitType, number>> = {};
  return types.map((type) => {
    const next = (counts[type] ?? 0) + 1;
    counts[type] = next;
    return next;
  });
}
