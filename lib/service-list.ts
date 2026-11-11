import type { ServicePlan } from "@/prisma/models";

/** Resumo de uma liturgia para a lista: sem o plano inteiro, só o que a lista mostra. */
export type ServicePlanSummary = {
  startTime: string | null;
  /** Quantas músicas a liturgia tem (unidades do tipo SONG). */
  songCount: number;
  /** Arranjos das músicas, na ordem em que aparecem na liturgia (sem repetir). */
  arrangementIds: number[];
};

export function summarizeServicePlan(plan: ServicePlan | null | undefined): ServicePlanSummary {
  const sections = [...(plan?.sections ?? [])].sort((a, b) => a.order - b.order);
  let songCount = 0;
  const arrangementIds: number[] = [];
  for (const section of sections) {
    const units = [...section.units].sort((a, b) => a.order - b.order);
    for (const unit of units) {
      if (unit.type !== "SONG") continue;
      songCount += 1;
      if (unit.arrangementId != null && !arrangementIds.includes(unit.arrangementId)) {
        arrangementIds.push(unit.arrangementId);
      }
    }
  }
  return { startTime: plan?.startTime ?? null, songCount, arrangementIds };
}
