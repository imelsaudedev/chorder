import { ClientService } from "@/prisma/models";

// Traduz os problemas de validação devolvidos pela API ao salvar um culto para
// frases que apontam o item e o campo, sem jargão técnico.

export type ServiceIssue = { path: (string | number)[]; message: string };

const UNIT_LABELS: Record<string, string> = {
  SONG: "Música",
  FALA: "Fala",
  LEITURA: "Leitura",
  ORACAO: "Oração",
  AVISOS: "Avisos",
  SERMAO: "Sermão",
  OUTRO: "Outro",
};

const FIELD_LABELS: Record<string, string> = {
  title: "o título",
  label: "o título",
  date: "a data",
  worshipLeader: "o dirigente",
  preacher: "o pregador",
  durationMin: "a duração",
  order: "a ordem",
  content: "o conteúdo",
  key: "o tom",
  name: "o nome",
};

function reason(message: string): string {
  if (/at least 1 character/i.test(message)) return "não pode ficar vazio";
  if (/required/i.test(message)) return "é obrigatório";
  if (/expected number/i.test(message)) return "precisa ser um número";
  if (/invalid date/i.test(message)) return "não é uma data válida";
  return "tem um valor inválido";
}

function field(path: (string | number)[]): string {
  const last = path[path.length - 1];
  // Bloco de uma cifra: "units", <índice>, "content"
  const unitsAt = path.lastIndexOf("units");
  if (unitsAt !== -1 && typeof path[unitsAt + 1] === "number" && path.includes("arrangement")) {
    const block = (path[unitsAt + 1] as number) + 1;
    const what = FIELD_LABELS[String(last)] ?? "um campo";
    return `no bloco ${block} da cifra, ${what}`;
  }
  return FIELD_LABELS[String(last)] ?? "um dos campos";
}

function where(path: (string | number)[], service: ClientService): string {
  // Lista derivada de músicas do culto: units.N...
  if (path[0] === "units" && typeof path[1] === "number") {
    const title = service.units?.[path[1]]?.arrangement?.song?.title;
    return title ? `Na música "${title}"` : "Em uma das músicas";
  }
  // Item do roteiro: plan.sections.S.units.U...
  if (path[0] === "plan" && path[1] === "sections" && typeof path[2] === "number") {
    const section = service.plan?.sections?.[path[2]];
    const sectionName = section?.label ? ` da seção "${section.label}"` : "";
    if (path[3] === "units" && typeof path[4] === "number") {
      const unit = section?.units?.[path[4]];
      const name =
        unit?.label?.trim() ||
        unit?.arrangement?.song?.title ||
        (unit ? UNIT_LABELS[unit.type] : undefined) ||
        `${path[4] + 1}`;
      return `No item "${name}"${sectionName}`;
    }
    return `Na seção ${section?.label ? `"${section.label}"` : path[2] + 1}`;
  }
  return "No culto";
}

export function friendlySaveError(raw: string, service: ClientService): string | null {
  let issues: ServiceIssue[];
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.error !== "invalid" || !Array.isArray(parsed.issues)) return null;
    issues = parsed.issues;
  } catch {
    return null;
  }
  if (issues.length === 0) return null;

  const seen = new Set<string>();
  const lines: string[] = [];
  for (const issue of issues) {
    const line = `${where(issue.path, service)}: ${field(issue.path)} ${reason(issue.message)}.`;
    if (!seen.has(line)) {
      seen.add(line);
      lines.push(line);
    }
  }
  const shown = lines.slice(0, 2).join(" ");
  return lines.length > 2 ? `${shown} (e mais ${lines.length - 2} problema${lines.length - 2 > 1 ? "s" : ""})` : shown;
}
