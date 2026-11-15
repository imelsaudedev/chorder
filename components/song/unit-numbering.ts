import { SongUnitType } from "@/prisma/models";

// Numeração do seletor de tipo do bloco (seção 8.2 da spec): "nome com
// numeração, igual à da leitura" — mesma regra incremental e incondicional
// de `unitTypeIndex` em column-logic.ts (ColumnViewer/index.tsx:87), só que
// calculada na ordem dos dados, não na distribuição em colunas, porque a
// regra de ouro da spec proíbe tocar em column-logic.ts. A numeração
// CONDICIONAL ("só se houver mais de um") da seção 8.2.1, usada pelas
// siglas do mapa da música e do Modo Palco, é a outra função deste
// arquivo, computeUnitTypeShortNumbers — as duas regras coexistem, cada
// uma no seu lugar (seletor de tipo vs. mapa/Palco).
export function computeUnitTypeNumbers(
  types: SongUnitType[]
): number[] {
  const counts: Partial<Record<SongUnitType, number>> = {};
  return types.map((type) => {
    const next = (counts[type] ?? 0) + 1;
    counts[type] = next;
    return next;
  });
}

// Numeração CONDICIONAL da seção 8.2.1 da spec ("só se houver mais de
// um") — usada pelas siglas do mapa da música e do Modo Palco, nunca pelo
// seletor de tipo do bloco (que usa a incondicional acima). Tabela igual
// ao protótipo (docs/prototipo-cifras/cabecalho-e-edicao.html, função
// labels()): Verso/Refrão/Ponte sempre numeram; Pré-refrão nunca; os
// demais só numeram quando há mais de um do mesmo tipo na música.
const ALWAYS_NUMBERED = new Set<SongUnitType>(["VERSE", "CHORUS", "BRIDGE"]);
const NEVER_NUMBERED = new Set<SongUnitType>(["PRECHORUS"]);

// Devolve, por posição, o número a mostrar (ou null quando este tipo não
// deve numerar aqui) — função pura e única, reaproveitada pelo mapa e pelo
// Modo Palco (seção 8.2.1: "função única que recebe tipo e posição").
// Quem chama monta o texto final (sigla/rótulo completo + número) via
// i18n (UnitTypesShort.*/UnitTypes.*), já que este módulo não depende de
// next-intl.
export function computeUnitTypeShortNumbers(
  types: SongUnitType[]
): (number | null)[] {
  const totals: Partial<Record<SongUnitType, number>> = {};
  types.forEach((type) => {
    totals[type] = (totals[type] ?? 0) + 1;
  });
  const seen: Partial<Record<SongUnitType, number>> = {};
  return types.map((type) => {
    const next = (seen[type] ?? 0) + 1;
    seen[type] = next;
    if (NEVER_NUMBERED.has(type)) return null;
    const multi = ALWAYS_NUMBERED.has(type) || (totals[type] ?? 0) > 1;
    return multi ? next : null;
  });
}
