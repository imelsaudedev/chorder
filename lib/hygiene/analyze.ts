// Funções puras da higienização da base de músicas (sem acesso a banco).

export type HUnit = { id: number; type: string; content: string; order: number };
export type HArrangement = {
  id: number;
  name: string | null;
  isDeleted: boolean;
  isServiceArrangement: boolean;
  originalArrangementId: number | null;
  hasServiceUnit: boolean;
  units: HUnit[];
};
export type HSong = {
  id: number;
  title: string;
  slug: string;
  artist: string | null;
  isDeleted: boolean;
  arrangements: HArrangement[];
};

export function normalizeTitle(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(
        prev[j] + 1,
        prev[j - 1] + 1,
        diag + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      diag = tmp;
    }
  }
  return prev[b.length];
}

/** Grupos de duplicatas exatas (título normalizado igual). */
export function findExactDuplicates(songs: HSong[]): HSong[][] {
  const map = new Map<string, HSong[]>();
  for (const s of songs) {
    const k = normalizeTitle(s.title);
    if (!k) continue;
    map.set(k, [...(map.get(k) ?? []), s]);
  }
  return [...map.values()].filter((g) => g.length > 1);
}

/** Pares prováveis (distância de edição ≤ 2, ou ≤ 12% do tamanho), fora das duplicatas exatas. */
export function findNearDuplicates(songs: HSong[]): [HSong, HSong, number][] {
  const items = songs.map((s) => ({ s, k: normalizeTitle(s.title) })).filter((i) => i.k.length >= 5);
  const out: [HSong, HSong, number][] = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i];
      const b = items[j];
      if (a.k === b.k || Math.abs(a.k.length - b.k.length) > 3) continue;
      const d = levenshtein(a.k, b.k);
      if (d <= Math.max(2, Math.floor(Math.max(a.k.length, b.k.length) * 0.12))) out.push([a.s, b.s, d]);
    }
  }
  return out;
}

const SMALL = new Set([
  "a", "o", "as", "os", "e", "de", "da", "do", "das", "dos", "em", "na", "no", "nas", "nos",
  "um", "uma", "com", "por", "para", "pra", "que", "se", "ao", "à", "ou", "teu", "tua",
]);
const ALWAYS_CAP = new Set(["deus", "senhor", "jesus", "cristo", "espírito", "santo", "pai", "rei", "messias", "yahweh", "jeová"]);

/** Sugestão de capitalização em pt-BR: palavras pequenas minúsculas, resto Capitalizado. */
export function suggestTitle(title: string): string {
  const words = title.trim().replace(/\s+/g, " ").split(" ");
  return words
    .map((w, i) => {
      const lower = w.toLowerCase();
      if (i > 0 && SMALL.has(lower) && !ALWAYS_CAP.has(lower)) return lower;
      return lower.replace(/(^|[(\-"'¿¡])(\p{L})/gu, (_, p, c) => p + c.toUpperCase());
    })
    .join(" ");
}

export function capitalizationIssue(title: string): string | null {
  const letters = title.replace(/[^\p{L}]/gu, "");
  if (letters.length > 3 && letters === letters.toUpperCase()) return "TUDO MAIÚSCULO";
  if (letters.length > 3 && letters === letters.toLowerCase()) return "tudo minúsculo";
  if (title !== title.trim() || /\s{2,}/.test(title)) return "espaços sobrando";
  return null;
}

const TOM_ONLY = /^\s*\[Tom:[^\]]*\]\s*$/i;
export const isTomUnit = (u: HUnit) => TOM_ONLY.test(u.content);

export type OrphanFinding = { songId: number; arrangementId?: number; unitId?: number; reason: string };

export function findOrphans(songs: HSong[]): OrphanFinding[] {
  const out: OrphanFinding[] = [];
  const arrById = new Map(songs.flatMap((s) => s.arrangements).map((a) => [a.id, a]));
  for (const s of songs) {
    const live = s.arrangements.filter((a) => !a.isServiceArrangement && !a.isDeleted);
    if (!s.isDeleted && live.length === 0) out.push({ songId: s.id, reason: "música ativa sem nenhum arranjo ativo" });
    for (const a of s.arrangements) {
      if (a.isServiceArrangement && !a.hasServiceUnit && !a.isDeleted)
        out.push({ songId: s.id, arrangementId: a.id, reason: "cópia de culto sem item de culto (órfã)" });
      if (a.originalArrangementId && arrById.get(a.originalArrangementId)?.isDeleted)
        out.push({ songId: s.id, arrangementId: a.id, reason: "cópia aponta para arranjo original excluído" });
      if (!a.isDeleted && !s.isDeleted && a.units.length === 0)
        out.push({ songId: s.id, arrangementId: a.id, reason: "arranjo sem nenhum bloco" });
      if (s.isDeleted && !a.isDeleted && !a.isServiceArrangement)
        out.push({ songId: s.id, arrangementId: a.id, reason: "arranjo ativo dentro de música excluída" });
      if (!a.isDeleted && !s.isDeleted) {
        for (const u of a.units) {
          if (u.content.trim() === "") out.push({ songId: s.id, arrangementId: a.id, unitId: u.id, reason: "bloco vazio" });
        }
        const orders = a.units.map((u) => u.order);
        if (new Set(orders).size !== orders.length)
          out.push({ songId: s.id, arrangementId: a.id, reason: "blocos com 'order' repetido" });
      }
    }
  }
  return out;
}

export type TypingFinding = { songId: number; arrangementId: number; kind: "nenhum-tipado" | "sem-verso-nem-refrao" | "parcial"; blocks: number; untyped: number };

/** Arranjos (não-culto) cujos blocos não receberam tipo (BLOCK) ou sem VERSE/CHORUS. */
export function findUntyped(songs: HSong[]): TypingFinding[] {
  const out: TypingFinding[] = [];
  for (const s of songs) {
    if (s.isDeleted) continue;
    for (const a of s.arrangements) {
      if (a.isDeleted || a.isServiceArrangement) continue;
      const content = a.units.filter((u) => !isTomUnit(u) && u.content.trim() !== "");
      if (content.length === 0) continue;
      const untyped = content.filter((u) => u.type === "BLOCK").length;
      const hasVC = content.some((u) => u.type === "VERSE" || u.type === "CHORUS");
      const base = { songId: s.id, arrangementId: a.id, blocks: content.length, untyped };
      if (untyped === content.length) out.push({ ...base, kind: "nenhum-tipado" });
      else if (!hasVC) out.push({ ...base, kind: "sem-verso-nem-refrao" });
      else if (untyped > 0) out.push({ ...base, kind: "parcial" });
    }
  }
  return out;
}
