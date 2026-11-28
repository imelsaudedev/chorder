/**
 * Quem conduz uma liturgia: uma ou mais pessoas, com conta (`userId`) ou só o nome digitado
 * (convidado, ou culto antigo). O texto `Service.worshipLeader` ("Hugo, Ana e Caio") é derivado
 * daqui e é o que a lista, os filtros e as estatísticas leem.
 */
export type ServiceLeaderEntry = {
  userId: string | null;
  name: string;
};

/** "Hugo", "Hugo e Ana", "Hugo, Ana e Caio". Sem nomes, nulo. */
export function joinLeaderNames(names: readonly string[]): string | null {
  const clean = names.map((n) => n.trim()).filter(Boolean);
  if (clean.length === 0) return null;
  if (clean.length === 1) return clean[0];
  return `${clean.slice(0, -1).join(", ")} e ${clean[clean.length - 1]}`;
}

/** Tira vazios e repetidos (mesma conta, ou mesmo nome sem conta, sem diferenciar maiúsculas). */
export function normalizeLeaders(entries: readonly ServiceLeaderEntry[] | null | undefined): ServiceLeaderEntry[] {
  const seen = new Set<string>();
  const result: ServiceLeaderEntry[] = [];
  for (const entry of entries ?? []) {
    const name = entry.name.trim();
    if (!name) continue;
    const key = entry.userId ? `u:${entry.userId}` : `n:${name.toLocaleLowerCase("pt-BR")}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ userId: entry.userId ?? null, name });
  }
  return result;
}

/**
 * Dirigentes de uma liturgia. Cultos salvos antes desta lista só têm o texto
 * (`worshipLeader`): viram um dirigente sem conta, até alguém salvar de novo.
 */
export function leadersOf(service: {
  leaders?: readonly ServiceLeaderEntry[] | null;
  worshipLeader?: string | null;
}): ServiceLeaderEntry[] {
  const fromList = normalizeLeaders(service.leaders);
  if (fromList.length > 0) return fromList;
  const legacy = service.worshipLeader?.trim();
  return legacy ? [{ userId: null, name: legacy }] : [];
}
