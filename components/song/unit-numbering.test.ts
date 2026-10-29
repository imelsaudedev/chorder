import { describe, expect, it } from "vitest";
import { computeUnitTypeNumbers } from "./unit-numbering";

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
