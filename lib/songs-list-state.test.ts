import { ClientSong } from "@/prisma/models";
import { describe, expect, it } from "vitest";
import { applySongsListState, initialOf, parseSongsListState, sortSongs } from "./songs-list-state";

const parse = (qs: string) => parseSongsListState(new URLSearchParams(qs));
const song = (title: string, extra: Partial<ClientSong> = {}) => ({ title, slug: title, lyrics: "", isDeleted: false, ...extra }) as ClientSong;

describe("parseSongsListState", () => {
  it("padrão: sem busca, sem categorias, por título crescente", () => {
    expect(parse("")).toEqual({ query: "", tagIds: [], sort: { key: "title", dir: "asc" } });
  });

  it("lê busca, categorias e ordenação", () => {
    expect(parse("query=gl&tags=3,7&sort=usage&dir=asc")).toEqual({
      query: "gl",
      tagIds: [3, 7],
      sort: { key: "usage", dir: "asc" },
    });
  });

  it("o uso começa pelo mais usado quando não há dir", () => {
    expect(parse("sort=usage").sort).toEqual({ key: "usage", dir: "desc" });
  });

  it("ignora valores inválidos e repetidos", () => {
    const s = parse("tags=3,abc,3,-1,0,2.5,9&sort=nada&dir=sideways");
    expect(s.tagIds).toEqual([3, 9]);
    expect(s.sort).toEqual({ key: "title", dir: "asc" });
  });
});

describe("applySongsListState", () => {
  it("valores padrão não aparecem na URL", () => {
    const p = applySongsListState(new URLSearchParams("tags=3&sort=usage"), { tagIds: [], sort: { key: "title", dir: "asc" } });
    expect(p.toString()).toBe("");
  });

  it("escreve categorias, ordenação e mantém os outros parâmetros", () => {
    const p = applySongsListState(new URLSearchParams("query=gl&x=1"), { tagIds: [2, 5], sort: { key: "artist", dir: "desc" } });
    expect(Object.fromEntries(p)).toEqual({ query: "gl", x: "1", tags: "2,5", sort: "artist", dir: "desc" });
  });

  it("o sentido padrão de cada ordenação não vai para a URL", () => {
    expect(applySongsListState(new URLSearchParams(), { sort: { key: "usage", dir: "desc" } }).toString()).toBe("sort=usage");
    expect(applySongsListState(new URLSearchParams(), { sort: { key: "usage", dir: "asc" } }).toString()).toBe("sort=usage&dir=asc");
  });

  it("dá a volta: o que se escreve se lê igual", () => {
    const state = { query: "amor", tagIds: [4, 1], sort: { key: "artist", dir: "desc" } as const };
    expect(parseSongsListState(applySongsListState(new URLSearchParams(), state))).toEqual(state);
  });
});

describe("sortSongs", () => {
  it("por título, ignorando acento e maiúscula", () => {
    const out = sortSongs([song("Zé"), song("água"), song("Abra")], { key: "title", dir: "asc" });
    expect(out.map((s) => s.title)).toEqual(["Abra", "água", "Zé"]);
    expect(sortSongs(out, { key: "title", dir: "desc" }).map((s) => s.title)).toEqual(["Zé", "água", "Abra"]);
  });

  it("por uso: mais usadas primeiro e empate pelo título", () => {
    const out = sortSongs([song("B", { usageCount: 1 }), song("A", { usageCount: 1 }), song("C", { usageCount: 5 }), song("D")], {
      key: "usage",
      dir: "desc",
    });
    expect(out.map((s) => s.title)).toEqual(["C", "A", "B", "D"]);
  });

  it("por compositor: sem autor fica por último nos dois sentidos", () => {
    const list = [song("S", { artist: null }), song("A", { artist: "Beto" }), song("B", { artist: "Ana" })];
    expect(sortSongs(list, { key: "artist", dir: "asc" }).map((s) => s.title)).toEqual(["B", "A", "S"]);
    expect(sortSongs(list, { key: "artist", dir: "desc" }).map((s) => s.title)).toEqual(["A", "B", "S"]);
  });

  it("não altera a lista original", () => {
    const list = [song("B"), song("A")];
    sortSongs(list, { key: "title", dir: "asc" });
    expect(list.map((s) => s.title)).toEqual(["B", "A"]);
  });
});

describe("initialOf", () => {
  it("minúscula e sem acento", () => {
    expect(initialOf("Águas")).toBe("a");
    expect(initialOf("  ótimo")).toBe("o");
  });
});
