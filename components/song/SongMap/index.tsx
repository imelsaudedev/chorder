"use client";

import { unitColorClasses } from "@/components/song/unit-colors";
import { computeUnitTypeShortNumbers } from "@/components/song/unit-numbering";
import { SongUnitType } from "@/prisma/models";
import { useTranslations } from "next-intl";

export type SongMapUnit = { type: SongUnitType };

type SongMapProps = {
  // Espelho das repetições existentes nos blocos — um chip por unidade, na
  // ordem da música, SEM deduplicar (repetição já é bloco duplicado desde
  // D5: "cada repetição é um bloco de verdade, não um multiplicador" —
  // ANALISE.md §G). Dois Refrão viram dois chips "R1"/"R2", não um só.
  units: SongMapUnit[];
  // Rola até o bloco (seção 8.2/9.9 das specs) — quem chama decide COMO
  // (ColumnViewer e StageMode têm containers de rolagem diferentes), o
  // mapa só avisa qual índice foi tocado. Sem isso, os chips são só
  // informação (não viram botões).
  onSelectUnit?: (index: number) => void;
  // Variante menor pro mapa preso no topo da leitura (cabeçalho da liturgia).
  compact?: boolean;
  // Variante "tudo numa linha só" (Modo Palco): os chips encolhem juntos pra
  // caber todos, mesmo que a sigla fique pouco legível. Visão geral, não navegação.
  fit?: boolean;
  className?: string;
};

// Mapa da música (seção 8.2.1 da spec de edição + 9.9 de referências de
// mídia): chips QUADRADOS com a sigla mínima de cada bloco, cor igual ao bloco
// correspondente (unit-colors.ts).
// - normal (leitura): 32px, quebra em linhas — sem rolagem lateral (e sem a
//   rolagem vertical "escondida" que o overflow-x criava ao girar a roda do
//   mouse em cima do mapa). Cabem 10 por linha num celular: até 20 blocos em 2 linhas.
// - compact (cabeçalho fixo da liturgia): 24px, também quebra em linhas.
// - fit (Modo Palco): uma linha, os chips encolhem juntos. Celular e tablet
//   usam a largura toda (teto 24/28px); no desktop (xl) a linha vira do tamanho
//   do conteúdo (chips de 32px), alinhada à direita pelo cabeçalho.
export default function SongMap({ units, onSelectUnit, compact = false, fit = false, className }: SongMapProps) {
  const t = useTranslations();
  const numbers = computeUnitTypeShortNumbers(units.map((u) => u.type));

  if (units.length === 0) return null;

  const containerClasses = fit
    ? "flex w-full items-center gap-0.5 xl:w-auto xl:max-w-full xl:gap-1 xl:overflow-x-auto xl:overflow-y-hidden no-scrollbar"
    : `flex flex-wrap items-center ${compact ? "gap-0.5" : "gap-1"}`;

  return (
    <div role="group" aria-label={t("SongMap.label")} className={`${containerClasses} ${className || ""}`}>
      {units.map((unit, index) => {
        const colorClasses = unitColorClasses[unit.type];
        const number = numbers[index];
        const abbr = t(`UnitTypesShort.${unit.type}`) + (number ?? "");
        const fullLabel = t(`UnitTypes.${unit.type}`) + (number ? ` ${number}` : "");
        const colors = `${colorClasses.border} ${colorClasses.background} ${colorClasses.text}`;

        if (fit) {
          return (
            <span
              key={index}
              title={fullLabel}
              aria-label={fullLabel}
              // Quadrado (aspect-square). Teto por largura de tela: celular 24px (encolhe
              // junto se houver muitos blocos), tablet 28px, desktop 32px (tamanho normal).
              className={`flex aspect-square min-w-0 max-w-6 flex-1 basis-0 items-center justify-center overflow-hidden whitespace-nowrap rounded-sm border text-[9px] font-semibold uppercase leading-none md:max-w-7 md:text-[10px] xl:size-8 xl:max-w-none xl:flex-none xl:basis-auto xl:rounded-md xl:text-xs ${colors}`}
            >
              {abbr}
            </span>
          );
        }

        const size = compact ? "size-6 rounded text-[11px]" : "size-8 rounded-md text-xs";
        const touch = compact ? "after:-inset-2" : "after:-inset-1.5";
        const chipClasses = `relative shrink-0 ${size} border font-semibold uppercase tracking-wide transition-colors ${colors}`;

        if (!onSelectUnit) {
          return (
            <span
              key={index}
              title={fullLabel}
              aria-label={fullLabel}
              className={`${chipClasses} inline-flex items-center justify-center`}
            >
              {abbr}
            </span>
          );
        }

        return (
          <button
            key={index}
            type="button"
            onClick={() => onSelectUnit(index)}
            aria-label={fullLabel}
            title={fullLabel}
            // O desenho é pequeno (32px / 24px); o alvo de toque de verdade
            // (≥44px) vem do after: invisível, igual ao chip do editor — "a
            // área de toque pode exceder o desenho" (seção 8.8/8.2.1).
            className={`${chipClasses} cursor-pointer inline-flex items-center justify-center p-0 hover:brightness-95 after:content-[''] after:absolute ${touch}`}
          >
            {abbr}
          </button>
        );
      })}
    </div>
  );
}
