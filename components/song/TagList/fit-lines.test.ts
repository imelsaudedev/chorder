import { describe, expect, it } from "vitest";
import { hiddenChipCount } from "./fit-lines";

describe("hiddenChipCount", () => {
  it("lista vazia ou limite inválido não esconde nada", () => {
    expect(hiddenChipCount([], 2)).toBe(0);
    expect(hiddenChipCount([0, 0], 0)).toBe(0);
  });

  it("tudo numa linha cabe", () => {
    expect(hiddenChipCount([0, 0, 0], 2)).toBe(0);
  });

  it("duas linhas cabem no limite de duas", () => {
    expect(hiddenChipCount([0, 0, 24, 24], 2)).toBe(0);
  });

  it("esconde os chips que passam da segunda linha", () => {
    // 2 na 1ª linha, 2 na 2ª, 3 na 3ª
    expect(hiddenChipCount([0, 0, 24, 24, 48, 48, 48], 2)).toBe(3);
  });

  it("com limite de 1 linha esconde tudo que está abaixo da primeira", () => {
    expect(hiddenChipCount([0, 0, 24, 48], 1)).toBe(2);
  });

  it("não depende da ordem em que os tops chegam", () => {
    expect(hiddenChipCount([48, 0, 24, 0], 2)).toBe(1);
  });
});
