import { describe, expect, it } from "vitest";
import { buildChordGrid, fieldKeyOptions, gridForField } from "./chord-grid";

describe("fieldKeyOptions", () => {
  it("oferece os 12 tons", () => {
    expect(fieldKeyOptions("G")).toHaveLength(12);
    expect(fieldKeyOptions("G")).toContain("G");
  });

  it("um tom da cifra fora da lista entra primeiro, para poder voltar a ele", () => {
    const options = fieldKeyOptions("C#");
    expect(options[0]).toBe("C#");
    expect(options).toHaveLength(13);
  });

  it("sem tom da cifra, só os 12", () => {
    expect(fieldKeyOptions("")).toHaveLength(12);
  });
});

describe("buildChordGrid por campo harmônico", () => {
  it("cada tom da lista gera uma grade de 7 graus começando pelo próprio tom, com a grafia escolhida", () => {
    for (const key of fieldKeyOptions("C")) {
      const grid = gridForField(key, "C", null);
      expect(grid).toHaveLength(7);
      expect(grid[0].triad).toBe(key);
    }
  });

  it("no tom da cifra vale a preferência de grafia; em outro tom, a grafia do tom escolhido", () => {
    expect(gridForField("D", "D", "flat")[0].triad).toBe("D");
    expect(gridForField("F#", "G", "flat")[0].triad).toBe("F#");
    expect(gridForField("Db", "G", "sharp")[0].triad).toBe("Db");
  });

  it("G: I G, IV C, V D", () => {
    const grid = buildChordGrid("G");
    expect([grid[0].triad, grid[3].triad, grid[4].triad]).toEqual(["G", "C", "D"]);
  });
});
