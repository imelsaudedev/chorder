const DAY_MS = 86_400_000;
const DAYS_PER_MONTH = 30.44;

/**
 * Descreve em português, de forma natural, há quanto tempo algo aconteceu:
 * "hoje", "ontem", "há 5 dias", "há 2 semanas", "há 3 meses", "há 1 ano e meio",
 * "há quase 3 anos", "há 7 anos". Datas no futuro contam como "hoje".
 */
export function formatTimeAgo(date: Date | string, now: Date | number = Date.now()): string {
  const then = typeof date === "string" ? new Date(date) : date;
  const days = Math.max(0, Math.floor((new Date(now).getTime() - then.getTime()) / DAY_MS));

  if (days === 0) return "hoje";
  if (days === 1) return "ontem";
  if (days < 7) return `há ${days} dias`;

  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? "há 1 semana" : `há ${weeks} semanas`;
  }

  if (days < 365) {
    const months = Math.max(1, Math.floor(days / DAYS_PER_MONTH));
    return months === 1 ? "há 1 mês" : `há ${months} meses`;
  }

  const years = Math.floor(days / 365);
  const leftoverMonths = Math.floor((days - years * 365) / DAYS_PER_MONTH);
  if (leftoverMonths >= 9) return `há quase ${years + 1} anos`;
  if (leftoverMonths >= 4) return years === 1 ? "há 1 ano e meio" : `há ${years} anos e meio`;
  return years === 1 ? "há 1 ano" : `há ${years} anos`;
}

/**
 * Versão resumida de `formatTimeAgo`, para espaços pequenos: sem "há" e sem
 * aproximações ("hoje", "ontem", "5 dias", "2 sem", "3 meses", "1 ano", "7 anos").
 */
export function formatTimeAgoShort(date: Date | string, now: Date | number = Date.now()): string {
  const then = typeof date === "string" ? new Date(date) : date;
  const days = Math.max(0, Math.floor((new Date(now).getTime() - then.getTime()) / DAY_MS));

  if (days === 0) return "hoje";
  if (days === 1) return "ontem";
  if (days < 7) return `${days} dias`;
  if (days < 30) return `${Math.floor(days / 7)} sem`;
  if (days < 365) {
    const months = Math.max(1, Math.floor(days / DAYS_PER_MONTH));
    return months === 1 ? "1 mês" : `${months} meses`;
  }
  // Anos "quase completos" (9 meses ou mais sobrando) contam como o ano seguinte,
  // igual à versão longa ("quase 4 anos" vira "4 anos").
  const years = Math.floor(days / 365);
  const leftoverMonths = Math.floor((days - years * 365) / DAYS_PER_MONTH);
  const rounded = leftoverMonths >= 9 ? years + 1 : years;
  return rounded === 1 ? "1 ano" : `${rounded} anos`;
}
