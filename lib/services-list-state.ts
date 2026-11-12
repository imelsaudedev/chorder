import { ServiceListItem } from "@/prisma/models";
import { groupByMonth } from "@/lib/service-list";

/**
 * Estado do histórico da lista de Liturgias, guardado na URL (o Voltar retoma a lista como estava):
 *   ?query=texto            busca (título, dirigente, pregador(a), tema, texto e títulos de músicas)
 *   ?year=2025              ano
 *   ?leader=Ana&leader=Beto dirigentes (vários)
 *   ?preacher=Caio          pregadores(as) (vários)
 *   ?sort=title&dir=asc     ordenação (padrão: data, da mais recente — não aparece na URL)
 *   ?group=year             agrupamento: month | year | leader | none
 *                           (padrão: mês quando ordena por data; senão, sem agrupar)
 */

export type ServiceSortKey = "date" | "title" | "leader";
export type ServiceSortDir = "asc" | "desc";
export type ServiceSort = { key: ServiceSortKey; dir: ServiceSortDir };
export type ServiceGroupBy = "month" | "year" | "leader" | "none";

export type ServicesListState = {
  query: string;
  year: number | null;
  leaders: string[];
  preachers: string[];
  sort: ServiceSort;
  /** `null` = padrão (ver `effectiveGroup`). */
  group: ServiceGroupBy | null;
};

export const SERVICE_SORT_KEYS: ServiceSortKey[] = ["date", "title", "leader"];
export const SERVICE_GROUPS: ServiceGroupBy[] = ["month", "year", "leader", "none"];

/** A data começa pela mais recente; título e dirigente, de A a Z. */
export const defaultServiceDir = (key: ServiceSortKey): ServiceSortDir => (key === "date" ? "desc" : "asc");

type ParamsReader = { get(name: string): string | null; getAll(name: string): string[] };

const unique = (values: string[]) =>
  values.map((v) => v.trim()).filter((v, i, all) => v !== "" && all.indexOf(v) === i);

export function parseServicesListState(params: ParamsReader): ServicesListState {
  const rawYear = Number(params.get("year"));
  const year = Number.isInteger(rawYear) && rawYear >= 1900 && rawYear <= 2999 ? rawYear : null;

  const rawKey = params.get("sort");
  const key = SERVICE_SORT_KEYS.includes(rawKey as ServiceSortKey) ? (rawKey as ServiceSortKey) : "date";
  const rawDir = params.get("dir");
  const dir = rawDir === "asc" || rawDir === "desc" ? rawDir : defaultServiceDir(key);

  const rawGroup = params.get("group");
  const group = SERVICE_GROUPS.includes(rawGroup as ServiceGroupBy) ? (rawGroup as ServiceGroupBy) : null;

  return {
    query: params.get("query") ?? "",
    year,
    leaders: unique(params.getAll("leader")),
    preachers: unique(params.getAll("preacher")),
    sort: { key, dir },
    group,
  };
}

/** Devolve novos parâmetros com o `patch` aplicado; valores padrão saem da URL. */
export function applyServicesListState(
  current: URLSearchParams,
  patch: Partial<ServicesListState>
): URLSearchParams {
  const params = new URLSearchParams(current.toString());
  const next = { ...parseServicesListState(params), ...patch };

  const setOrDelete = (name: string, value: string | null) => {
    if (value) params.set(name, value);
    else params.delete(name);
  };
  const setAll = (name: string, values: string[]) => {
    params.delete(name);
    unique(values).forEach((v) => params.append(name, v));
  };

  setOrDelete("query", next.query.trim() ? next.query : null);
  setOrDelete("year", next.year ? String(next.year) : null);
  setAll("leader", next.leaders);
  setAll("preacher", next.preachers);
  setOrDelete("sort", next.sort.key === "date" ? null : next.sort.key);
  setOrDelete("dir", next.sort.dir === defaultServiceDir(next.sort.key) ? null : next.sort.dir);
  setOrDelete("group", next.group);
  return params;
}

export const effectiveGroup = (state: Pick<ServicesListState, "group" | "sort">): ServiceGroupBy =>
  state.group ?? (state.sort.key === "date" ? "month" : "none");

/** Há busca ou filtro ligado (ordenação e agrupamento não contam). */
export const hasActiveFilters = (s: ServicesListState) =>
  s.query.trim() !== "" || s.year !== null || s.leaders.length > 0 || s.preachers.length > 0;

/** Minúsculas e sem acento, para buscar "oracao" e achar "Oração". */
export const normalize = (text: string) =>
  text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();

const clean = (value: string | null | undefined) => value?.trim() ?? "";

export function filterServices(items: ServiceListItem[], state: ServicesListState): ServiceListItem[] {
  const terms = normalize(state.query).split(/\s+/).filter(Boolean);
  const leaders = new Set(state.leaders.map(normalize));
  const preachers = new Set(state.preachers.map(normalize));

  return items.filter((s) => {
    if (state.year !== null && new Date(s.date).getFullYear() !== state.year) return false;
    if (leaders.size > 0 && !leaders.has(normalize(clean(s.worshipLeader)))) return false;
    if (preachers.size > 0 && !preachers.has(normalize(clean(s.preacher)))) return false;
    if (terms.length === 0) return true;
    const haystack = normalize(
      [s.title, s.worshipLeader, s.preacher, s.sermonTheme, s.sermonReference, ...(s.songTitles ?? [])]
        .filter(Boolean)
        .join(" ")
    );
    return terms.every((term) => haystack.includes(term));
  });
}

const collator = new Intl.Collator("pt-BR", { sensitivity: "base", numeric: true });
const time = (s: ServiceListItem) => new Date(s.date).getTime();

export function sortServices(items: ServiceListItem[], sort: ServiceSort): ServiceListItem[] {
  const sign = sort.dir === "asc" ? 1 : -1;
  const byDate = (a: ServiceListItem, b: ServiceListItem) => time(b) - time(a); // desempate: mais recente
  const compare = (a: ServiceListItem, b: ServiceListItem): number => {
    if (sort.key === "date") return sign * (time(a) - time(b));
    if (sort.key === "title") {
      const d = collator.compare(clean(a.title), clean(b.title));
      return d !== 0 ? sign * d : byDate(a, b);
    }
    // dirigente: quem não tem fica por último, em qualquer sentido
    const x = clean(a.worshipLeader);
    const y = clean(b.worshipLeader);
    if (!x && !y) return byDate(a, b);
    if (!x) return 1;
    if (!y) return -1;
    const d = collator.compare(x, y);
    return d !== 0 ? sign * d : byDate(a, b);
  };
  return [...items].sort(compare);
}

export type ServiceGroup = {
  key: string;
  /** Mês (para o rótulo "mês de ano"); nos demais grupos, `null`. */
  date: Date | null;
  /** Rótulo pronto quando não é mês (ano ou dirigente). */
  label: string | null;
  items: ServiceListItem[];
};

/** Agrupa mantendo a ordem recebida. `none` devolve um grupo só, sem faixa. */
export function groupServices(
  items: ServiceListItem[],
  by: ServiceGroupBy,
  noLeaderLabel = ""
): ServiceGroup[] {
  if (by === "month") return groupByMonth(items).map((g) => ({ ...g, label: null }));
  if (by === "none") return items.length ? [{ key: "all", date: null, label: null, items }] : [];

  const groups = new Map<string, ServiceGroup>();
  for (const item of items) {
    const label = by === "year" ? String(new Date(item.date).getFullYear()) : clean(item.worshipLeader) || noLeaderLabel;
    const key = by === "year" ? label : normalize(label);
    const group = groups.get(key) ?? { key, date: null, label, items: [] };
    group.items.push(item);
    groups.set(key, group);
  }
  return [...groups.values()];
}

/** Opções dos seletores, tiradas do próprio histórico (anos do mais recente ao mais antigo; nomes de A a Z). */
export function filterOptions(items: ServiceListItem[]) {
  const years = [...new Set(items.map((s) => new Date(s.date).getFullYear()))].sort((a, b) => b - a);
  const names = (pick: (s: ServiceListItem) => string | null | undefined) => {
    const map = new Map<string, string>();
    for (const s of items) {
      const name = clean(pick(s));
      if (name && !map.has(normalize(name))) map.set(normalize(name), name);
    }
    return [...map.values()].sort(collator.compare);
  };
  return { years, leaders: names((s) => s.worshipLeader), preachers: names((s) => s.preacher) };
}
