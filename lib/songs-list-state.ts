import { ClientSong } from "@/prisma/models";

/**
 * Estado da lista de Músicas que mora na URL (assim o Voltar e o botão voltar do
 * navegador retomam a lista como estava):
 *   ?query=texto        busca
 *   ?tags=3,7           categorias (ids das tags)
 *   ?sort=usage&dir=asc ordenação (padrão: título, crescente — não aparece na URL)
 */

export type SongSortKey = "title" | "usage" | "artist";
export type SongSortDir = "asc" | "desc";
export type SongSort = { key: SongSortKey; dir: SongSortDir };
export type SongsListState = { query: string; tagIds: number[]; sort: SongSort };

export const DEFAULT_SORT: SongSort = { key: "title", dir: "asc" };

export const SORT_KEYS: SongSortKey[] = ["title", "usage", "artist"];

/** Sentido padrão de cada ordenação: o uso começa pelo mais usado. */
export const defaultDir = (key: SongSortKey): SongSortDir => (key === "usage" ? "desc" : "asc");

type ParamsReader = { get(name: string): string | null };

export function parseSongsListState(params: ParamsReader): SongsListState {
  const query = params.get("query") ?? "";

  const tagIds = (params.get("tags") ?? "")
    .split(",")
    .map((t) => Number(t))
    .filter((n, i, all) => Number.isInteger(n) && n > 0 && all.indexOf(n) === i);

  const rawKey = params.get("sort");
  const key = SORT_KEYS.includes(rawKey as SongSortKey) ? (rawKey as SongSortKey) : "title";
  const rawDir = params.get("dir");
  const dir = rawDir === "asc" || rawDir === "desc" ? rawDir : defaultDir(key);

  return { query, tagIds, sort: { key, dir } };
}

/** Devolve novos parâmetros com o `patch` aplicado; valores padrão saem da URL. */
export function applySongsListState(
  current: URLSearchParams,
  patch: Partial<SongsListState>
): URLSearchParams {
  const params = new URLSearchParams(current.toString());
  const next = { ...parseSongsListState(params), ...patch };

  const setOrDelete = (name: string, value: string | null) => {
    if (value) params.set(name, value);
    else params.delete(name);
  };

  setOrDelete("query", next.query.trim() ? next.query : null);
  setOrDelete("tags", next.tagIds.length > 0 ? next.tagIds.join(",") : null);
  setOrDelete("sort", next.sort.key === "title" ? null : next.sort.key);
  setOrDelete("dir", next.sort.dir === defaultDir(next.sort.key) ? null : next.sort.dir);
  return params;
}

const collator = new Intl.Collator("pt-BR", { sensitivity: "base", numeric: true });

/** Letra de agrupamento de um título (minúscula e sem acento). */
export function initialOf(title: string): string {
  return title.trim().charAt(0).toLowerCase().normalize("NFKD").replace(/\p{Diacritic}/gu, "");
}

export function sortSongs(songs: ClientSong[], sort: SongSort): ClientSong[] {
  const sign = sort.dir === "asc" ? 1 : -1;
  const byTitle = (a: ClientSong, b: ClientSong) => collator.compare(a.title, b.title);

  const compare = (a: ClientSong, b: ClientSong): number => {
    if (sort.key === "title") return sign * byTitle(a, b);
    if (sort.key === "usage") {
      const d = (a.usageCount ?? 0) - (b.usageCount ?? 0);
      return d !== 0 ? sign * d : byTitle(a, b);
    }
    // compositor: quem não tem autor fica por último, em qualquer sentido
    const x = a.artist?.trim() ?? "";
    const y = b.artist?.trim() ?? "";
    if (!x && !y) return byTitle(a, b);
    if (!x) return 1;
    if (!y) return -1;
    const d = collator.compare(x, y);
    return d !== 0 ? sign * d : byTitle(a, b);
  };

  return [...songs].sort(compare);
}
