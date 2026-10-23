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

/**
 * "plan": culto de verdade — um item só está completo quando tem o conteúdo que o
 * torna útil (música escolhida, quem faz, versão...).
 * "template": esqueleto — título e duração já são o conteúdo; nada é "pendente".
 */
export type PlanMode = "plan" | "template";

export type UnitSummary = {
  /** Texto principal (título da música, rótulo do item...). Nulo quando não há nada a mostrar. */
  title: string | null;
  /** Complemento abaixo do título: arranjo e tom, quem faz, versão... */
  subtitle: string | null;
  /** Texto de apoio (descrição, texto da leitura). */
  detail: string | null;
  /** Sub-itens de avisos. */
  bullets: string[];
  /** Chamada exibida quando não há título. */
  placeholder: string;
  /** O item ainda precisa de algo para ficar completo (só no modo "plan"). */
  pending: boolean;
  /** O que falta, quando já há título mas o item continua pendente. */
  hint: string | null;
};

const PLACEHOLDER: Record<string, string> = {
  SONG: "Adicione uma música",
  FALA: "Adicione uma fala",
  ORACAO: "Adicione uma oração",
  LEITURA: "Adicione uma leitura",
  SERMAO: "Adicione um sermão",
  AVISOS: "Adicione avisos",
};

export function summarizeUnit(
  unit: ClientServiceUnit,
  typeLabel: string,
  mode: PlanMode = "plan"
): UnitSummary {
  const placeholder = PLACEHOLDER[unit.type] ?? "Preencher item";
  const typedLabel = unit.label?.trim() || null;
  const isTemplate = mode === "template";

  const base = { detail: null, bullets: [] as string[], placeholder, pending: false, hint: null };

  switch (unit.type) {
    case "SONG": {
      if (isTemplate) {
        // No template a música é só um espaço (com título opcional); nada é escolhido.
        return { ...base, title: typedLabel ?? typeLabel, subtitle: null };
      }
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
        ...base,
        title,
        subtitle: title && subtitle ? subtitle : null,
        // Espaço vindo de um template com título ("Música de abertura"): mostra o título na chamada.
        placeholder: !title && typedLabel ? `${placeholder} · ${typedLabel}` : placeholder,
        pending: !title,
      };
    }
    case "FALA":
    case "ORACAO": {
      const meta = unit.metadata as FalaMeta | null;
      const speaker = meta?.speaker?.trim() || null;
      const missing = !speaker && !isTemplate;
      return {
        ...base,
        title: typedLabel ?? (speaker || isTemplate ? typeLabel : null),
        subtitle: speaker,
        detail: meta?.description ?? null,
        pending: missing,
        hint: missing && typedLabel ? "Falta definir quem faz" : null,
      };
    }
    case "LEITURA": {
      const meta = unit.metadata as LeituraMeta | null;
      const version = meta?.version?.trim() || null;
      const missing = !version && !isTemplate;
      return {
        ...base,
        title: typedLabel ?? (version || isTemplate ? typeLabel : null),
        subtitle: version,
        detail: meta?.text ?? null,
        pending: missing,
        hint: missing && typedLabel ? "Falta definir a versão" : null,
      };
    }
    case "SERMAO": {
      const meta = unit.metadata as SermaoMeta | null;
      const preacher = meta?.preacher?.trim() || null;
      const missing = !preacher && !isTemplate;
      return {
        ...base,
        title: typedLabel ?? (preacher || isTemplate ? typeLabel : null),
        subtitle: preacher,
        detail: meta?.description ?? null,
        pending: missing,
        hint: missing && typedLabel ? "Falta definir o pregador" : null,
      };
    }
    case "AVISOS": {
      const items = ((unit.metadata as AvisosMeta | null)?.items ?? []).filter((i) => i.text.trim());
      const hasItems = items.length > 0;
      return {
        ...base,
        title: hasItems || isTemplate ? "Avisos" : null,
        subtitle: hasItems ? `${items.length} ${items.length === 1 ? "item" : "itens"}` : null,
        bullets: items.map((i) => i.text),
        pending: !hasItems && !isTemplate,
      };
    }
    default:
      return { ...base, title: typedLabel ?? typeLabel, subtitle: null };
  }
}

export function isUnitPending(unit: ClientServiceUnit): boolean {
  return summarizeUnit(unit, "").pending;
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
