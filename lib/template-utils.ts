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
    type: s.type as ServiceSectionType,
    label: s.label,
    order: i + 1,
    units: (s.units ?? []).map((u, j) => ({
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
