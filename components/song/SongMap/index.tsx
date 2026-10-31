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
  // mapa só avisa qual índice foi tocado.
  onSelectUnit?: (index: number) => void;
  // Variante fina pra quando o mapa fica "preso" no topo (cabeçalho da
  // liturgia, barra do Modo Palco): chips menores pra caber numa linha só.
  compact?: boolean;
  className?: string;
};

// Mapa da música (seção 8.2.1 da spec de edição + 9.9 de referências de
// mídia): linha horizontal ROLÁVEL (não quebra linha) de chips com a
// sigla mínima de cada bloco, cor igual ao bloco correspondente
// (unit-colors.ts). Mesmo componente serve a view normal (tamanho do
// protótipo) e a variante compacta usada quando substitui o cabeçalho
// fixo ao rolar (compact=true) — ver ArrangementView/StageMode.
export default function SongMap({ units, onSelectUnit, compact = false, className }: SongMapProps) {
  const t = useTranslations();
  const numbers = computeUnitTypeShortNumbers(units.map((u) => u.type));

  if (units.length === 0) return null;

  return (
    <div
      role="group"
      aria-label={t("SongMap.label")}
      className={`flex items-center ${compact ? "gap-1" : "gap-1.5"} overflow-x-auto no-scrollbar ${className || ""}`}
    >
      {units.map((unit, index) => {
        const colorClasses = unitColorClasses[unit.type];
        const number = numbers[index];
        const abbr = t(`UnitTypesShort.${unit.type}`) + (number ?? "");
        const fullLabel = t(`UnitTypes.${unit.type}`) + (number ? ` ${number}` : "");
        return (
          <button
            key={index}
            type="button"
            onClick={() => onSelectUnit?.(index)}
            aria-label={fullLabel}
            title={fullLabel}
            // min-w-9 (36px, spec) no desenho; o alvo de toque de verdade
            // (≥44px) vem do after: invisível, igual ao chip do editor —
            // "a área de toque pode exceder o desenho" (seção 8.8/8.2.1).
            className={`relative shrink-0 ${compact ? "min-w-7 h-6 px-1.5 rounded text-[11px]" : "min-w-9 h-8 px-2.5 rounded-md text-xs"} border font-semibold uppercase tracking-wide cursor-pointer transition-colors after:content-[''] after:absolute ${compact ? "after:-inset-2" : "after:-inset-1.5"} ${colorClasses.border} ${colorClasses.background} ${colorClasses.text} hover:brightness-95`}
          >
            {abbr}
          </button>
        );
      })}
    </div>
  );
}
