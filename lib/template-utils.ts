import { ClientServiceSection, ClientServiceTemplate, ClientServiceUnit, ServiceSectionType } from "@/prisma/models";

type RawUnit = {
  type: string;
  label?: string | null;
  durationMin?: number | null;
  metadata?: unknown;
};

type RawSection = {
  type: string;
  label: string;
  units?: RawUnit[];
};

type TemplateItems = {
  sections?: RawSection[];
  defaultStartTime?: string;
};

export function buildSectionsFromTemplate(
  template: ClientServiceTemplate
): ClientServiceSection[] {
  const items = template.items as TemplateItems | null;
  return (items?.sections ?? []).map((s, i) => ({
    id: crypto.randomUUID(),
    type: s.type as ServiceSectionType,
    label: s.label,
    order: i + 1,
    units: (s.units ?? []).map((u, j) => ({
      clientId: crypto.randomUUID(),
      type: u.type as ClientServiceUnit["type"],
      label: u.label ?? null,
      order: j + 1,
      durationMin: u.durationMin ?? null,
      metadata: u.metadata ?? null,
      arrangementId: null,
      semitoneTranspose: null,
    })),
  }));
}

export function getTemplateDefaultStartTime(
  template: ClientServiceTemplate
): string | null {
  const items = template.items as TemplateItems | null;
  return items?.defaultStartTime ?? null;
}

function formatMinutes(total: number): string {
  if (total < 60) return `${total} min`;
  const hours = Math.floor(total / 60);
  const minutes = Math.round(total % 60);
  return minutes === 0 ? `${hours}h` : `${hours}h${String(minutes).padStart(2, "0")}`;
}

/** Resumo curto do template: "3 seções · 14 itens · 1h20 · 09:00". */
export function summarizeTemplate(template: ClientServiceTemplate): string {
  const items = template.items as TemplateItems | null;
  const sections = items?.sections ?? [];
  const units = sections.flatMap((section) => section.units ?? []);
  const totalMinutes = units.reduce((sum, unit) => sum + (unit.durationMin ?? 0), 0);

  return [
    `${sections.length} ${sections.length === 1 ? "seção" : "seções"}`,
    `${units.length} ${units.length === 1 ? "item" : "itens"}`,
    totalMinutes > 0 ? formatMinutes(totalMinutes) : null,
    items?.defaultStartTime ?? null,
  ]
    .filter(Boolean)
    .join(" · ");
}
