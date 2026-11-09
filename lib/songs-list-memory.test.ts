import { beforeEach, describe, expect, it } from "vitest";
import { clearSongsListMemory, readSongsListMemory, saveSongsListMemory, songSlugFromHref } from "./songs-list-memory";

beforeEach(() => window.sessionStorage.clear());

describe("songs-list-memory", () => {
  it("guarda e lê onde a pessoa saiu da lista", () => {
    saveSongsListMemory({ url: "/songs?tags=3", scrollY: 840, slug: "a-cada-momento" }, 1000);
    expect(readSongsListMemory(2000)).toEqual({ url: "/songs?tags=3", scrollY: 840, slug: "a-cada-momento", savedAt: 1000 });
  });

  it("expira depois de 30 minutos", () => {
    saveSongsListMemory({ url: "/songs", scrollY: 0, slug: "x" }, 0);
    expect(readSongsListMemory(30 * 60 * 1000 + 1)).toBeNull();
    expect(readSongsListMemory(30 * 60 * 1000)).not.toBeNull();
  });

  it("limpar apaga", () => {
    saveSongsListMemory({ url: "/songs", scrollY: 0, slug: "x" });
    clearSongsListMemory();
    expect(readSongsListMemory()).toBeNull();
  });

  it("descarta lixo e endereços fora de /songs", () => {
    window.sessionStorage.setItem("songs:list-memory", "não é json");
    expect(readSongsListMemory()).toBeNull();
    window.sessionStorage.setItem("songs:list-memory", JSON.stringify({ url: "https://evil.example", scrollY: 1, slug: "x", savedAt: Date.now() }));
    expect(readSongsListMemory()).toBeNull();
  });
});

describe("songSlugFromHref", () => {
  it("extrai o slug da música", () => {
    expect(songSlugFromHref("/songs/a-cada-momento")).toBe("a-cada-momento");
    expect(songSlugFromHref("/songs/a-cada-momento/edit?x=1")).toBe("a-cada-momento");
    expect(songSlugFromHref("/services/x")).toBeNull();
    expect(songSlugFromHref("/songs")).toBeNull();
  });
});
