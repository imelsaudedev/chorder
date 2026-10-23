import { transposeChord } from "@/chopro/music";
import { ClientServiceSection, ClientServiceUnit } from "@/prisma/models";

export type FalaMeta = { speaker?: string | null; description?: string | null };
export type LeituraMeta = { version?: string | null; text?: string | null };
export type SermaoMeta = {
  preacher?: string | null;
  reference?: string | null;
  description?: string | null;
};
export type AvisosMeta = { items?: { id: string; text: string }[] };

export type UnitSummary = {
  /** Texto principal (título da música, rótulo do tipo...). Nulo quando o item está pendente. */
  title: string | null;
  /** Complemento ao lado do título: arranjo, quem faz, versão... */
  subtitle: string | null;
  /** Texto de apoio (descrição, texto da leitura). */
  detail: string | null;
  /** Sub-itens de avisos. */
  bullets: string[];
  /** Chamada exibida quando o item ainda não foi preenchido. */
  placeholder: string;
};

const PLACEHOLDER: Record<string, string> = {
  SONG: "Adicione uma música",
  FALA: "Adicione uma fala",
  ORACAO: "Adicione uma oração",
  LEITURA: "Adicione uma leitura",
  SERMAO: "Adicione um sermão",
  AVISOS: "Adicione avisos",
};

export function summarizeUnit(unit: ClientServiceUnit, typeLabel: string): UnitSummary {
  const placeholder = PLACEHOLDER[unit.type] ?? "Preencher item";
  const label = unit.label ?? typeLabel;

  switch (unit.type) {
    case "SONG": {
      const title = unit.arrangement?.song?.title ?? null;
      // Sublinha: arranjo (quando tem nome) e tom, já com a transposição do plano.
      const arrangement = unit.arrangement;
      const key = arrangement?.key
        ? transposeChord(arrangement.key, arrangement.key, unit.semitoneTranspose ?? 0)
        : null;
      const subtitle = [arrangement?.name?.trim() || null, key ? `Tom ${key}` : null]
        .filter(Boolean)
        .join(" · ");
      return {
        title,
        subtitle: title && subtitle ? subtitle : null,
        detail: null,
        bullets: [],
        placeholder,
      };
    }
    case "FALA":
    case "ORACAO": {
      const meta = unit.metadata as FalaMeta | null;
      const speaker = meta?.speaker ?? null;
      return {
        title: speaker ? label : null,
        subtitle: speaker,
        detail: meta?.description ?? null,
        bullets: [],
        placeholder,
      };
    }
    case "LEITURA": {
      const meta = unit.metadata as LeituraMeta | null;
      const version = meta?.version ?? null;
      return {
        title: version ? label : null,
        subtitle: version,
        detail: meta?.text ?? null,
        bullets: [],
        placeholder,
      };
    }
    case "SERMAO": {
      const meta = unit.metadata as SermaoMeta | null;
      const preacher = meta?.preacher ?? null;
      return {
        title: preacher ? label : null,
        subtitle: preacher,
        detail: meta?.description ?? null,
        bullets: [],
        placeholder,
      };
    }
    case "AVISOS": {
      const items = ((unit.metadata as AvisosMeta | null)?.items ?? []).filter((i) => i.text.trim());
      return {
        title: items.length > 0 ? "Avisos" : null,
        subtitle: items.length > 0 ? `${items.length} ${items.length === 1 ? "item" : "itens"}` : null,
        detail: null,
        bullets: items.map((i) => i.text),
        placeholder,
      };
    }
    default:
      return { title: label, subtitle: null, detail: null, bullets: [], placeholder };
  }
}

export function isUnitPending(unit: ClientServiceUnit): boolean {
  return summarizeUnit(unit, "").title === null;
}

export function countPlanProgress(sections: ClientServiceSection[]): { filled: number; total: number } {
  let filled = 0;
  let total = 0;
  for (const section of sections) {
    for (const unit of section.units ?? []) {
      total += 1;
      if (!isUnitPending(unit)) filled += 1;
    }
  }
  return { filled, total };
}

export const SECTION_TYPE_LABEL = {
  PRE_CULTO: "Pré-culto",
  CULTO: "Culto",
  POS_CULTO: "Pós-culto",
  ESPECIAL: "Especial",
} as const;
