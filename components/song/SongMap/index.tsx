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
  // Variante estreita pro mapa preso no topo da leitura (cabeçalho da
  // liturgia): paddings horizontais reduzidos pra caber mais chips; ainda
  // rola na horizontal se não couber e mantém o toque.
  compact?: boolean;
  // Variante "tudo numa linha só", sem rolagem: os chips encolhem juntos
  // pra caber todos, mesmo que a sigla fique pouco legível (Modo Palco —
  // aqui o mapa é visão geral, não navegação).
  fit?: boolean;
  className?: string;
};

// Mapa da música (seção 8.2.1 da spec de edição + 9.9 de referências de
// mídia): chips com a sigla mínima de cada bloco, cor igual ao bloco
// correspondente (unit-colors.ts). Tamanho normal (protótipo), compact
// (preso no cabeçalho, ainda tocável) ou fit (uma linha, só informação).
export default function SongMap({ units, onSelectUnit, compact = false, fit = false, className }: SongMapProps) {
  const t = useTranslations();
  const numbers = computeUnitTypeShortNumbers(units.map((u) => u.type));

  if (units.length === 0) return null;

  const containerClasses = fit
    ? "flex w-full items-center gap-0.5"
    : `flex items-center ${compact ? "gap-0.5" : "gap-1.5"} overflow-x-auto no-scrollbar`;

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
              className={`flex h-5 min-w-0 max-w-9 flex-1 basis-0 items-center justify-center overflow-hidden whitespace-nowrap rounded-sm border text-[9px] font-semibold uppercase leading-none ${colors}`}
            >
              {abbr}
            </span>
          );
        }

        const size = compact
          ? "min-w-6 h-6 px-1 rounded text-[11px]"
          : "min-w-9 h-8 px-2.5 rounded-md text-xs";
        const touch = compact ? "after:-inset-2" : "after:-inset-1.5";
        const className = `relative shrink-0 ${size} border font-semibold uppercase tracking-wide transition-colors ${colors}`;

        if (!onSelectUnit) {
          return (
            <span key={index} title={fullLabel} aria-label={fullLabel} className={`${className} inline-flex items-center justify-center`}>
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
            // O desenho é pequeno (min-w-9 / min-w-6); o alvo de toque de
            // verdade (≥44px) vem do after: invisível, igual ao chip do
            // editor — "a área de toque pode exceder o desenho" (seção
            // 8.8/8.2.1).
            className={`${className} cursor-pointer hover:brightness-95 after:content-[''] after:absolute ${touch}`}
          >
            {abbr}
          </button>
        );
      })}
    </div>
  );
}
