import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Apoio ao formulário de nova liturgia: o título sugerido e os atalhos de data e hora.

const WEEKDAYS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
// Domingo e sábado são masculinos ("4º domingo"); os demais, femininos ("3ª sexta").
const MASCULINE_WEEKDAYS = new Set([0, 6]);

/** "4º domingo de outubro", "3ª sexta de setembro". */
export function ordinalWeekdayLabel(date: Date): string {
  const weekday = date.getDay();
  const nth = Math.ceil(date.getDate() / 7);
  const ordinalMark = MASCULINE_WEEKDAYS.has(weekday) ? "º" : "ª";
  const month = format(date, "LLLL", { locale: ptBR });
  return `${nth}${ordinalMark} ${WEEKDAYS[weekday]} de ${month}`;
}

/**
 * Título sugerido: nome do modelo (ou "Culto") + referência no calendário.
 * Ex.: "Culto dominical – 4º domingo de outubro". Sem data, não há o que sugerir.
 */
export function buildServiceTitle(templateName: string | null | undefined, date: Date | null): string {
  if (!date) return "";
  const name = templateName?.trim() || "Culto";
  return `${name} – ${ordinalWeekdayLabel(date)}`;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}


/**
 * Próximo domingo a partir de hoje (hoje mesmo, se for domingo). Os cultos são
 * prioritariamente dominicais, então este é o único atalho de data. É sempre a data do
 * calendário: se já houver uma liturgia nesse dia, quem avisa é o formulário.
 */
export function nextSunday(now: Date = new Date()): Date {
  const date = startOfDay(now);
  date.setDate(date.getDate() + ((7 - date.getDay()) % 7));
  return date;
}
