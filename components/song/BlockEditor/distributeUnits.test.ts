import { describe, expect, it } from "vitest";
import { ClientSongUnit } from "@/prisma/models";
import { findBestDistribution } from "@/components/song/ArrangementView/ColumnViewer/column-logic";
import { distributeUnitsIntoColumns } from "./distributeUnits";

function makeUnit(
  type: ClientSongUnit["type"],
  content: string,
  order: number
): ClientSongUnit {
  return { type, content, order, notes: null, repeatCount: 1 };
}

const SAMPLE_UNITS: ClientSongUnit[] = [
  makeUnit("INTRO", "[D]Intro curta", 1),
  makeUnit("VERSE", "[D]Primeira linha\n[G]Segunda linha\n[A]Terceira linha", 2),
  makeUnit("CHORUS", "[D]Refrão\n[G]Com mais linhas\n[A]Pra pesar na altura\n[Bm]Mais uma", 3),
  makeUnit("TEXT", "Observação em texto livre\ncom duas linhas", 4),
  makeUnit("VERSE", "[D]Segundo verso\n[G]Curtinho", 5),
  makeUnit("ENDING", "[D]Final", 6),
];

describe("distributeUnitsIntoColumns", () => {
  it.each([1, 2, 3])("preserva todas as unidades, na ordem, com %i colunas", (columns) => {
    const result = distributeUnitsIntoColumns(SAMPLE_UNITS, columns);
    const flattened = result.flat();
    expect(flattened.map((p) => p.unit)).toEqual(SAMPLE_UNITS);
    expect(flattened.map((p) => p.index)).toEqual(SAMPLE_UNITS.map((_, i) => i));
  });

  it("o comprimento de cada coluna bate com o de findBestDistribution", () => {
    const columns = 2;
    const expected = findBestDistribution(SAMPLE_UNITS, columns).map((c) => c.length);
    const result = distributeUnitsIntoColumns(SAMPLE_UNITS, columns);
    expect(result.map((c) => c.length)).toEqual(expected);
  });

  it("lista vazia não quebra", () => {
    expect(distributeUnitsIntoColumns([], 2)).toEqual([]);
  });

  it("uma coluna só devolve tudo numa faixa só", () => {
    const result = distributeUnitsIntoColumns(SAMPLE_UNITS, 1);
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(SAMPLE_UNITS.length);
  });
});
