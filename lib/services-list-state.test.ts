import { ServiceListItem } from "@/prisma/models";
import { describe, expect, it } from "vitest";
import {
  applyServicesListState,
  effectiveGroup,
  filterOptions,
  filterServices,
  groupServices,
  hasActiveFilters,
  parseServicesListState,
  sortServices,
} from "./services-list-state";

const parse = (qs: string) => parseServicesListState(new URLSearchParams(qs));
const svc = (slug: string, date: string, extra: Partial<ServiceListItem> = {}) =>
  ({
    slug,
    title: slug,
    date: new Date(date),
    worshipLeader: null,
    preacher: null,
    sermonTheme: null,
    sermonReference: null,
    startTime: null,
    songCount: 0,
    songTitles: [],
    updatedAt: new Date(date),
    ...extra,
  }) as ServiceListItem;

const items = [
  svc("culto-a", "2025-03-10T12:00:00", { worshipLeader: "Ana", preacher: "Caio", sermonTheme: "Graça", songTitles: ["Oração Final"] }),
  svc("culto-b", "2024-11-02T12:00:00", { worshipLeader: "Beto", sermonReference: "Jo 3.16" }),
  svc("culto-c", "2025-03-24T12:00:00", { worshipLeader: "ana", preacher: "Dani" }),
  svc("culto-d", "2024-01-05T12:00:00"),
];

describe("parseServicesListState", () => {
  it("padrão: sem filtros, por data da mais recente, grupo padrão", () => {
    expect(parse("")).toEqual({
      query: "",
      year: null,
      leaders: [],
      preachers: [],
      sort: { key: "date", dir: "desc" },
      group: null,
    });
  });

  it("lê tudo e aceita nomes repetidos na URL", () => {
    const s = parse("query=gra&year=2025&leader=Ana&leader=Beto&preacher=Caio&sort=title&group=year");
    expect(s.year).toBe(2025);
    expect(s.leaders).toEqual(["Ana", "Beto"]);
    expect(s.preachers).toEqual(["Caio"]);
    expect(s.sort).toEqual({ key: "title", dir: "asc" });
    expect(s.group).toBe("year");
  });

  it("ignora valores inválidos e repetidos", () => {
    const s = parse("year=abc&leader=Ana&leader=Ana&leader=&sort=x&dir=y&group=z");
    expect(s.year).toBeNull();
    expect(s.leaders).toEqual(["Ana"]);
    expect(s.sort).toEqual({ key: "date", dir: "desc" });
    expect(s.group).toBeNull();
  });
});

describe("applyServicesListState", () => {
  it("valores padrão saem da URL", () => {
    const p = applyServicesListState(new URLSearchParams("query=x&year=2025"), {
      query: "",
      year: null,
      sort: { key: "date", dir: "desc" },
    });
    expect(p.toString()).toBe("");
  });

  it("escreve e preserva nomes com vírgula e acento", () => {
    const p = applyServicesListState(new URLSearchParams(), { leaders: ["Silva, João", "Ana"], sort: { key: "leader", dir: "desc" } });
    const back = parseServicesListState(p);
    expect(back.leaders).toEqual(["Silva, João", "Ana"]);
    expect(back.sort).toEqual({ key: "leader", dir: "desc" });
  });
});

describe("effectiveGroup / hasActiveFilters", () => {
  it("agrupa por mês quando ordena por data; senão, não agrupa", () => {
    expect(effectiveGroup(parse(""))).toBe("month");
    expect(effectiveGroup(parse("sort=title"))).toBe("none");
    expect(effectiveGroup(parse("sort=title&group=year"))).toBe("year");
  });

  it("ordenação e grupo não contam como filtro", () => {
    expect(hasActiveFilters(parse("sort=title&group=year"))).toBe(false);
    expect(hasActiveFilters(parse("query=%20"))).toBe(false);
    expect(hasActiveFilters(parse("year=2025"))).toBe(true);
  });
});

describe("filterServices", () => {
  const f = (qs: string) => filterServices(items, parse(qs)).map((s) => s.slug);

  it("sem filtros devolve tudo", () => expect(f("")).toHaveLength(4));
  it("busca sem acento e sem diferenciar maiúsculas, inclusive em títulos de músicas", () => {
    expect(f("query=oracao")).toEqual(["culto-a"]);
    expect(f("query=GRACA")).toEqual(["culto-a"]);
    expect(f("query=jo%203")).toEqual(["culto-b"]);
  });
  it("todas as palavras precisam aparecer", () => {
    expect(f("query=ana%20caio")).toEqual(["culto-a"]);
    expect(f("query=ana%20beto")).toEqual([]);
  });
  it("filtra por ano, dirigente (sem diferenciar maiúsculas) e pregador(a)", () => {
    expect(f("year=2024")).toEqual(["culto-b", "culto-d"]);
    expect(f("leader=Ana")).toEqual(["culto-a", "culto-c"]);
    expect(f("leader=Ana&leader=Beto")).toEqual(["culto-a", "culto-b", "culto-c"]);
    expect(f("preacher=Dani")).toEqual(["culto-c"]);
  });
  it("combina filtros", () => expect(f("year=2025&leader=Ana&preacher=Caio")).toEqual(["culto-a"]));
});

describe("sortServices", () => {
  const s = (qs: string) => sortServices(items, parse(qs).sort).map((x) => x.slug);

  it("data: da mais recente à mais antiga e o inverso", () => {
    expect(s("")).toEqual(["culto-c", "culto-a", "culto-b", "culto-d"]);
    expect(s("dir=asc")).toEqual(["culto-d", "culto-b", "culto-a", "culto-c"]);
  });
  it("título de A a Z", () => expect(s("sort=title")).toEqual(["culto-a", "culto-b", "culto-c", "culto-d"]));
  it("dirigente: sem dirigente por último em qualquer sentido", () => {
    expect(s("sort=leader")).toEqual(["culto-c", "culto-a", "culto-b", "culto-d"]);
    expect(s("sort=leader&dir=desc").at(-1)).toBe("culto-d");
  });
});

describe("groupServices", () => {
  const sorted = sortServices(items, { key: "date", dir: "desc" });
  it("por mês", () => expect(groupServices(sorted, "month").map((g) => g.key)).toEqual(["2025-03", "2024-11", "2024-01"]));
  it("por ano", () => {
    const g = groupServices(sorted, "year");
    expect(g.map((x) => x.label)).toEqual(["2025", "2024"]);
    expect(g[0].items).toHaveLength(2);
  });
  it("por dirigente junta grafias iguais e nomeia os sem dirigente", () => {
    const g = groupServices(sorted, "leader", "Sem dirigente");
    expect(g.map((x) => x.label)).toEqual(["ana", "Beto", "Sem dirigente"]);
    expect(g[0].items).toHaveLength(2);
  });
  it("sem agrupar: um grupo só; lista vazia: nenhum", () => {
    expect(groupServices(sorted, "none")).toHaveLength(1);
    expect(groupServices([], "none")).toEqual([]);
  });
});

describe("filterOptions", () => {
  it("anos do mais recente ao mais antigo e nomes de A a Z, sem repetir", () => {
    expect(filterOptions(items)).toEqual({ years: [2025, 2024], leaders: ["Ana", "Beto"], preachers: ["Caio", "Dani"] });
  });
});
