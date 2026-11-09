/**
 * Lembra de onde a pessoa saiu da lista de Músicas (endereço com busca, categorias
 * e ordenação, mais a posição da rolagem), para o Voltar da música retomar a lista
 * exatamente como estava. Fica só na sessão do navegador (sessionStorage).
 */

const KEY = "songs:list-memory";
const TTL_MS = 30 * 60 * 1000;

export type SongsListMemory = {
  /** Endereço da lista, com os parâmetros (ex.: /songs?tags=3&sort=usage). */
  url: string;
  scrollY: number;
  /** Música aberta a partir da lista. */
  slug: string;
  savedAt: number;
};

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
}

export function saveSongsListMemory(memory: Omit<SongsListMemory, "savedAt">, now = Date.now()) {
  try {
    storage()?.setItem(KEY, JSON.stringify({ ...memory, savedAt: now }));
  } catch {
    // armazenamento cheio ou bloqueado: a lista só não retoma a posição
  }
}

export function readSongsListMemory(now = Date.now()): SongsListMemory | null {
  try {
    const raw = storage()?.getItem(KEY);
    if (!raw) return null;
    const m = JSON.parse(raw) as Partial<SongsListMemory>;
    if (
      typeof m.url !== "string" ||
      !m.url.startsWith("/songs") ||
      typeof m.slug !== "string" ||
      typeof m.scrollY !== "number" ||
      typeof m.savedAt !== "number" ||
      now - m.savedAt > TTL_MS
    ) {
      return null;
    }
    return m as SongsListMemory;
  } catch {
    return null;
  }
}

export function clearSongsListMemory() {
  try {
    storage()?.removeItem(KEY);
  } catch {
    // ignora
  }
}

/** Slug da música a partir de um endereço /songs/<slug>[/...]. */
export function songSlugFromHref(href: string): string | null {
  const m = /^\/songs\/([^/?#]+)/.exec(href);
  return m ? decodeURIComponent(m[1]) : null;
}
