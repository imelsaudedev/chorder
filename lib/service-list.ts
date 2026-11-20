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

type Dated = { date: Date | string };

const toDate = (value: Date | string) => (value instanceof Date ? value : new Date(value));

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Separa as liturgias de hoje em diante (do mais próximo ao mais distante) das
 * passadas (da mais recente à mais antiga). Hoje conta como "próxima".
 */
export function splitUpcomingAndPast<T extends Dated>(
  items: T[],
  now: Date = new Date()
): { upcoming: T[]; past: T[] } {
  const today = startOfDay(now).getTime();
  const upcoming: T[] = [];
  const past: T[] = [];
  for (const item of items) {
    (toDate(item.date).getTime() >= today ? upcoming : past).push(item);
  }
  upcoming.sort((a, b) => toDate(a.date).getTime() - toDate(b.date).getTime());
  past.sort((a, b) => toDate(b.date).getTime() - toDate(a.date).getTime());
  return { upcoming, past };
}

/** Agrupa por mês, mantendo a ordem recebida (as passadas chegam da mais recente à mais antiga). */
export function groupByMonth<T extends Dated>(items: T[]): { key: string; date: Date; items: T[] }[] {
  const groups = new Map<string, { key: string; date: Date; items: T[] }>();
  for (const item of items) {
    const date = toDate(item.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const group = groups.get(key) ?? { key, date: new Date(date.getFullYear(), date.getMonth(), 1), items: [] };
    group.items.push(item);
    groups.set(key, group);
  }
  return [...groups.values()];
}

/** Dias de calendário entre hoje e a data (0 = hoje, negativo = passado). */
export function daysUntil(date: Date | string, now: Date = new Date()): number {
  return Math.round((startOfDay(toDate(date)).getTime() - startOfDay(now).getTime()) / 86_400_000);
}
