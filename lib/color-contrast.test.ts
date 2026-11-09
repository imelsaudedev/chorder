import { describe, expect, it } from "vitest";
import { contrastRatio, mixRgb, parseHex, readableTint, relativeLuminance } from "./color-contrast";

describe("parseHex", () => {
  it("lê #rrggbb, #rgb e sem #", () => {
    expect(parseHex("#ff8800")).toEqual([255, 136, 0]);
    expect(parseHex("#f80")).toEqual([255, 136, 0]);
    expect(parseHex("FF8800")).toEqual([255, 136, 0]);
  });

  it("devolve null para valores inválidos", () => {
    expect(parseHex("")).toBeNull();
    expect(parseHex("#12")).toBeNull();
    expect(parseHex("vermelho")).toBeNull();
    expect(parseHex("#gggggg")).toBeNull();
  });
});

describe("contrastRatio", () => {
  it("preto sobre branco é 21 e cores iguais são 1", () => {
    expect(contrastRatio([0, 0, 0], [255, 255, 255])).toBeCloseTo(21, 5);
    expect(contrastRatio([120, 30, 200], [120, 30, 200])).toBeCloseTo(1, 5);
  });

  it("é simétrico", () => {
    const a: [number, number, number] = [5, 150, 105];
    const b: [number, number, number] = [250, 250, 250];
    expect(contrastRatio(a, b)).toBeCloseTo(contrastRatio(b, a), 10);
  });

  it("luminância vai de 0 a 1", () => {
    expect(relativeLuminance([0, 0, 0])).toBe(0);
    expect(relativeLuminance([255, 255, 255])).toBeCloseTo(1, 5);
  });
});

describe("mixRgb", () => {
  it("t=0 é a primeira cor, t=1 é a segunda, t=0.5 fica no meio", () => {
    expect(mixRgb([0, 0, 0], [200, 100, 50], 0)).toEqual([0, 0, 0]);
    expect(mixRgb([0, 0, 0], [200, 100, 50], 1)).toEqual([200, 100, 50]);
    expect(mixRgb([0, 0, 0], [200, 100, 50], 0.5)).toEqual([100, 50, 25]);
  });
});

describe("readableTint", () => {
  const swatches = [
    "#059669", "#0d9488", "#2563eb", "#4f46e5", "#7c3aed", "#be123c", "#dc2626", "#ea580c", "#f59e0b", "#475569",
    "#10b981", "#3b82f6", "#8b5cf6", "#ef4444", "#ec4899", "#eab308", "#facc15", "#ffffff", "#000000",
  ];

  it.each(swatches)("garante contraste >= 4,5 para %s", (hex) => {
    expect(readableTint(hex).ratio).toBeGreaterThanOrEqual(4.5);
  });

  it("escurece o texto das cores claras (âmbar) mais do que as escuras", () => {
    const lum = (hex: string) => {
      const [r, g, b] = readableTint(hex).foreground.match(/\d+/g)!.map(Number);
      return relativeLuminance([r, g, b]);
    };
    expect(lum("#f59e0b")).toBeLessThan(relativeLuminance([245, 158, 11]));
  });

  it("não escurece quando a cor já tem contraste (roxo)", () => {
    expect(readableTint("#7c3aed").foreground).toBe("rgb(124, 58, 237)");
  });

  it("cor inválida cai num cinza legível, sem quebrar", () => {
    const t = readableTint("não-é-cor");
    expect(t.ratio).toBeGreaterThanOrEqual(4.5);
  });

  it("respeita um contraste mínimo maior", () => {
    expect(readableTint("#2563eb", { minContrast: 7 }).ratio).toBeGreaterThanOrEqual(7);
  });
});
