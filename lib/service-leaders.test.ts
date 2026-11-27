import { describe, expect, it } from "vitest";
import { joinLeaderNames, leadersOf, normalizeLeaders } from "./service-leaders";

describe("joinLeaderNames", () => {
  it("junta no português", () => {
    expect(joinLeaderNames([])).toBeNull();
    expect(joinLeaderNames(["Hugo"])).toBe("Hugo");
    expect(joinLeaderNames(["Hugo", "Ana"])).toBe("Hugo e Ana");
    expect(joinLeaderNames(["Hugo", "Ana", "Caio"])).toBe("Hugo, Ana e Caio");
  });
  it("ignora nomes vazios", () => {
    expect(joinLeaderNames(["Hugo", "  ", "Ana"])).toBe("Hugo e Ana");
  });
});

describe("normalizeLeaders", () => {
  it("tira vazios e repetidos, por conta ou por nome", () => {
    expect(
      normalizeLeaders([
        { userId: "u1", name: " Hugo " },
        { userId: "u1", name: "Hugo Silva" },
        { userId: null, name: "ana" },
        { userId: null, name: "Ana" },
        { userId: null, name: "  " },
      ])
    ).toEqual([
      { userId: "u1", name: "Hugo" },
      { userId: null, name: "ana" },
    ]);
  });
});

describe("leadersOf", () => {
  it("usa a lista quando existe", () => {
    expect(leadersOf({ leaders: [{ userId: "u1", name: "Hugo" }], worshipLeader: "Outro" })).toEqual([
      { userId: "u1", name: "Hugo" },
    ]);
  });
  it("culto antigo: o texto vira um dirigente sem conta", () => {
    expect(leadersOf({ leaders: [], worshipLeader: "Hugo" })).toEqual([{ userId: null, name: "Hugo" }]);
  });
  it("sem nada, lista vazia", () => {
    expect(leadersOf({ worshipLeader: null })).toEqual([]);
  });
});
