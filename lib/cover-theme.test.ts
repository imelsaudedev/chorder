import { describe, expect, it } from "vitest";
import { contrastRatio, parseHex } from "./color-contrast";
import { coverFromColor, coverTheme } from "./cover-theme";

describe("coverTheme", () => {
  it("usa tinta branca em fundo escuro", () => {
    const t = coverTheme([20, 40, 90], [10, 25, 60]);
    expect(t.light).toBe(true);
    expect(t.ink).toBe("#fff");
  });

  it("usa tinta escura em fundo claro", () => {
    const t = coverTheme([250, 240, 200], [230, 220, 180]);
    expect(t.light).toBe(false);
  });

  it("atinge contraste mínimo em cores comuns (topo e base)", () => {
    for (const hex of ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed", "#facc15"]) {
      const { theme } = coverFromColor(hex);
      expect(theme.ratio, hex).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("cor inválida cai num cinza neutro", () => {
    const { theme, background } = coverFromColor("xyz");
    expect(theme.ratio).toBeGreaterThanOrEqual(4.5);
    expect(background).toContain("linear-gradient");
    expect(parseHex("#71717a")).not.toBeNull();
    expect(contrastRatio([0, 0, 0], [255, 255, 255])).toBeCloseTo(21);
  });
});
