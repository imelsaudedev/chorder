import { joinLeaderNames } from "@/lib/service-leaders";
import type { ServicePlan } from "@/prisma/models";

/**
 * Pregador, tema e texto de uma liturgia. Não são da liturgia: vivem no item Sermão do roteiro
 * (`metadata.preacher`, `label` = tema, `metadata.reference`). Culto sem item Sermão (só canções)
 * não tem pregador.
 */
export type SermonSummary = {
  /** Pregadores de todos os sermões, juntos ("A e B"). */
  preacher: string | null;
  /** Tema do primeiro sermão. */
  theme: string | null;
  /** Texto bíblico do primeiro sermão que tiver um. */
  reference: string | null;
};

const clean = (value: string | null | undefined) => value?.trim() || null;

export function summarizeSermons(plan: ServicePlan | null | undefined): SermonSummary {
  const sermons = [...(plan?.sections ?? [])]
    .sort((a, b) => a.order - b.order)
    .flatMap((section) => [...section.units].sort((a, b) => a.order - b.order))
    .filter((unit) => unit.type === "SERMAO");

  const preachers: string[] = [];
  for (const unit of sermons) {
    const name = clean((unit.metadata as { preacher?: string | null } | null)?.preacher);
    if (name && !preachers.some((p) => p.localeCompare(name, "pt-BR", { sensitivity: "base" }) === 0)) {
      preachers.push(name);
    }
  }

  const theme = clean(sermons.map((u) => clean(u.label)).find(Boolean));
  const reference = sermons
    .map((u) => clean((u.metadata as { reference?: string | null } | null)?.reference))
    .find(Boolean);

  return {
    preacher: joinLeaderNames(preachers),
    theme: theme ?? null,
    reference: reference ?? null,
  };
}
