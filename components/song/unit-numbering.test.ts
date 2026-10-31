import { describe, expect, it } from "vitest";
import { computeUnitTypeNumbers, computeUnitTypeShortNumbers } from "./unit-numbering";

describe("computeUnitTypeNumbers", () => {
  it("numera cada tipo na ordem dos dados, incondicionalmente", () => {
    const types = ["INTRO", "VERSE", "CHORUS", "VERSE", "CHORUS", "ENDING"] as const;
    expect(computeUnitTypeNumbers([...types])).toEqual([1, 1, 1, 2, 2, 1]);
  });

  it("numera mesmo quando só existe uma unidade do tipo", () => {
    expect(computeUnitTypeNumbers(["BRIDGE"])).toEqual([1]);
  });

  it("recomeça a contagem independente da ordem de aparição entre tipos", () => {
    const types = ["SOLO", "SOLO", "INTRO", "SOLO"] as const;
    expect(computeUnitTypeNumbers([...types])).toEqual([1, 2, 1, 3]);
  });

  it("lista vazia não quebra", () => {
    expect(computeUnitTypeNumbers([])).toEqual([]);
  });
});

describe("computeUnitTypeShortNumbers", () => {
  it("reproduz o exemplo do protótipo: I, V1, R1, IL, V2, R2, F", () => {
    const types = [
      "INTRO", "VERSE", "CHORUS", "INTERLUDE", "VERSE", "CHORUS", "ENDING",
    ] as const;
    expect(computeUnitTypeShortNumbers([...types])).toEqual([null, 1, 1, null, 2, 2, null]);
  });

  it("Verso/Refrão/Ponte sempre numeram, mesmo com um só", () => {
    expect(computeUnitTypeShortNumbers(["VERSE"])).toEqual([1]);
    expect(computeUnitTypeShortNumbers(["CHORUS"])).toEqual([1]);
    expect(computeUnitTypeShortNumbers(["BRIDGE"])).toEqual([1]);
  });

  it("Pré-refrão nunca numera, mesmo repetido", () => {
    expect(computeUnitTypeShortNumbers(["PRECHORUS", "PRECHORUS"])).toEqual([null, null]);
  });

  it("os demais tipos só numeram quando há mais de um", () => {
    expect(computeUnitTypeShortNumbers(["INTRO"])).toEqual([null]);
    expect(computeUnitTypeShortNumbers(["INTRO", "INTRO"])).toEqual([1, 2]);
    expect(computeUnitTypeShortNumbers(["SOLO", "BLOCK", "TEXT"])).toEqual([null, null, null]);
  });

  it("lista vazia não quebra", () => {
    expect(computeUnitTypeShortNumbers([])).toEqual([]);
  });
});
