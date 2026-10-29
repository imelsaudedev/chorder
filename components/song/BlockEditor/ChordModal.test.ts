import { describe, expect, it } from "vitest";
import { resolveChordModalWidth } from "./ChordModal";

// Achado em teste manual: no desktop, a largura do bloco (uma coluna
// inteira da leitura) fazia o modal ficar enorme. A largura nunca passa de
// um máximo fixo, mesmo quando o bloco é mais largo que isso.
describe("resolveChordModalWidth", () => {
  it("usa a largura do bloco quando ela é menor que o máximo (mobile)", () => {
    expect(resolveChordModalWidth(260)).toBe(260);
  });

  it("limita ao máximo quando o bloco é mais largo (desktop)", () => {
    expect(resolveChordModalWidth(720)).toBe(320);
  });

  it("usa o máximo quando a largura ainda não foi medida", () => {
    expect(resolveChordModalWidth(null)).toBe(320);
  });
});
