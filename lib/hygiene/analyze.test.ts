import { describe, expect, it } from "vitest";
import { capitalizationIssue, findExactDuplicates, findNearDuplicates, findOrphans, findUntyped, normalizeTitle, suggestTitle, type HSong } from "./analyze";

const song = (id: number, title: string, units: [string, string][] = [], extra: Partial<HSong> = {}): HSong => ({
  id, title, slug: `s${id}`, artist: null, isDeleted: false,
  arrangements: [{ id: id * 10, name: null, isDeleted: false, isServiceArrangement: false, originalArrangementId: null, hasServiceUnit: false,
    units: units.map(([type, content], i) => ({ id: id * 100 + i, type, content, order: i })) }],
  ...extra,
});

describe("higienização", () => {
  it("normaliza títulos", () => expect(normalizeTitle("Grande é o Senhor (Ao Vivo)!")).toBe("grande e o senhor"));
  it("acha duplicatas exatas e parecidas", () => {
    const l = [song(1, "A ALEGRIA"), song(2, "A Alegria"), song(3, "Grande Deus Poderoso"), song(4, "Grande Deus Poderozo")];
    expect(findExactDuplicates(l)).toHaveLength(1);
    expect(findNearDuplicates(l).map(([a, b]) => [a.id, b.id])).toEqual([[3, 4]]);
  });
  it("sugere capitalização pt-BR", () => {
    expect(suggestTitle("A ALEGRIA DA MINHA ALEGRIA")).toBe("A Alegria da Minha Alegria");
    expect(capitalizationIssue("A ALEGRIA")).toBe("TUDO MAIÚSCULO");
    expect(capitalizationIssue("A Alegria")).toBeNull();
  });
  it("detecta blocos sem tipo ignorando bloco de Tom", () => {
    const f = findUntyped([song(1, "x", [["BLOCK", "[Tom:D]"], ["BLOCK", "a"], ["BLOCK", "b"]]), song(2, "y", [["INTRO", "i"], ["BLOCK", "a"]]), song(3, "z", [["VERSE", "v"], ["BLOCK", "a"]])]);
    expect(f.map((x) => x.kind)).toEqual(["nenhum-tipado", "sem-verso-nem-refrao", "parcial"]);
  });
  it("detecta órfãos", () => {
    const r = findOrphans([song(1, "a", [["VERSE", "  "]]), song(2, "b", [])]);
    expect(r.map((x) => x.reason)).toEqual(["bloco vazio", "arranjo sem nenhum bloco"]);
  });
});
