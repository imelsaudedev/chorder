import { ClientSongUnit } from "@/prisma/models";
import { describe, expect, it } from "vitest";
import { findBestDistribution } from "./column-logic";

// Cada linha "[C]x" conta como 2 linhas de texto (cifra + letra).
function unit(lines: number, type: ClientSongUnit["type"] = "VERSE"): ClientSongUnit {
  return {
    type,
    content: Array.from({ length: lines }, () => "[C]x").join("\n"),
    order: 1,
    notes: null,
    repeatCount: 1,
  } as ClientSongUnit;
}

describe("findBestDistribution", () => {
  it("uma coluna fica com todos os blocos", () => {
    const columns = findBestDistribution([unit(2), unit(2), unit(2)], 1);
    expect(columns).toHaveLength(1);
    expect(columns[0]).toHaveLength(3);
  });

  it("nunca reordena nem perde blocos", () => {
    const units = [unit(5), unit(1), unit(1), unit(1), unit(3)];
    const columns = findBestDistribution(units, 3);
    expect(columns.flat().map((u) => u.unitTypeIndex)).toEqual([1, 2, 3, 4, 5]);
    columns.forEach((column) => expect(column.length).toBeGreaterThan(0));
  });

  it("conta o custo fixo de cada bloco: um bloco grande e vários curtos não saem em colunas de alturas muito diferentes", () => {
    // Sem o custo por bloco (cabeçalho + padding + espaço), o grande (5 linhas = 10) parecia
    // quase igual aos 6 curtos juntos (6 × 2 = 12) e ficava sozinho de um lado; na tela os
    // curtos ocupam bem mais. Com o custo, o grande leva dois curtos e os outros quatro ficam na outra coluna.
    const units = [unit(5), unit(1), unit(1), unit(1), unit(1), unit(1), unit(1)];
    const columns = findBestDistribution(units, 2);
    expect(columns.map((column) => column.length)).toEqual([3, 4]);
  });

  it("com mais colunas que blocos, cada bloco ganha a sua", () => {
    const columns = findBestDistribution([unit(2), unit(2)], 4);
    expect(columns.map((column) => column.length)).toEqual([1, 1]);
  });
});
