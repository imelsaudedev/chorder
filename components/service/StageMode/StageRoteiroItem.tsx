"use client";

import { ServiceUnitTypeValue, UNIT_CONFIG } from "@/components/service/ServicePlanEditor/unitConfig";
import { summarizeUnit } from "@/components/service/ServicePlanEditor/unitSummary";
import { ClientServiceUnit } from "@/prisma/models";

const TYPE_LABELS: Record<string, string> = {
  FALA: "Fala",
  ORACAO: "Oração",
  LEITURA: "Leitura",
  AVISOS: "Avisos",
  SERMAO: "Sermão",
  OUTRO: "Outro",
};

export function roteiroTypeLabel(unit: ClientServiceUnit): string {
  return TYPE_LABELS[unit.type] ?? "Item";
}

/** Título que aparece na caixa e no cabeçalho do Palco: o rótulo do item, ou o tipo quando não há rótulo. */
export function roteiroTitle(unit: ClientServiceUnit): string {
  return summarizeUnit(unit, roteiroTypeLabel(unit)).title ?? roteiroTypeLabel(unit);
}

/** "Ana · 3 min" — responsável (ou versão, pregador...) e duração, o que existir. */
export function roteiroMeta(unit: ClientServiceUnit): string {
  const summary = summarizeUnit(unit, roteiroTypeLabel(unit));
  const mins = unit.durationMin ? `${unit.durationMin} min` : null;
  return [summary.subtitle, mins].filter(Boolean).join(" · ");
}

type StageRoteiroItemProps = {
  unit: ClientServiceUnit;
  /** Mesma fonte dos blocos da cifra — o corpo do item segue o tamanho escolhido.
   * Sem ela, herda do contêiner (a visão geral escala a fonte do contêiner). */
  fontSize?: number;
  /** Primeiro item de um conjunto logo depois de uma música: vão maior em cima (rolagem). */
  spaceBefore?: boolean;
  /** Último item de um conjunto logo antes de uma música: vão maior embaixo (rolagem). */
  spaceAfter?: boolean;
};

// Tamanho do tipo (ícone + rótulo) e da linha de responsável/duração: cresce com a tela.
const TYPE_SIZE = "text-[0.75em] md:text-[0.85em] xl:text-[0.95em]";

/**
 * Item do roteiro que não é música (fala, oração, leitura, avisos, sermão),
 * mostrado no Modo Palco entre as músicas quando "Exibir roteiro" está ligado.
 * Visual dos blocos de música: cantos `rounded-lg` e borda, só que em cinza bem
 * claro (a mesma escala -50 / -200 dos blocos coloridos). O tipo leva o ícone e a
 * cor do editor do culto (UNIT_CONFIG). Sem conteúdo vira uma linha compacta.
 */
export default function StageRoteiroItem({ unit, fontSize, spaceBefore = false, spaceAfter = false }: StageRoteiroItemProps) {
  const type = roteiroTypeLabel(unit);
  const summary = summarizeUnit(unit, type);
  const title = summary.title ?? type;
  const meta = roteiroMeta(unit);
  const hasBody = !!summary.detail || summary.bullets.length > 0;
  const config = UNIT_CONFIG[unit.type as ServiceUnitTypeValue];
  const Icon = config?.icon;

  const style = fontSize ? { fontSize } : undefined;
  // Em um conjunto de itens o vão é pequeno; entre uma música e o conjunto, 2em.
  const spacing = `${spaceBefore ? "mt-[2em]" : "mt-3"} ${spaceAfter ? "mb-[2em]" : "mb-3"}`;
  const box = `rounded-lg border border-slate-200 bg-slate-50 px-[1em] leading-snug ${spacing}`;

  const typeLabel = (
    <span className={`flex shrink-0 items-center gap-[0.4em] font-bold uppercase tracking-wider ${TYPE_SIZE} ${config?.color ?? "text-muted-foreground"}`}>
      {Icon && <Icon className="size-[1.25em] shrink-0" aria-hidden />}
      {type}
    </span>
  );
  const metaLabel = meta && (
    <span className={`font-semibold text-muted-foreground ${TYPE_SIZE}`}>{meta}</span>
  );

  if (!hasBody) {
    return (
      <div style={style} className={`${box} flex items-center gap-[0.6em] py-[0.6em]`}>
        {typeLabel}
        <span className="min-w-0 flex-1 font-semibold">{title}</span>
        {metaLabel}
      </div>
    );
  }

  return (
    <div style={style} className={`${box} py-[0.75em]`}>
      <div className="flex items-center justify-between gap-2">
        {typeLabel}
        {metaLabel}
      </div>
      <p className="mt-[0.3em] font-semibold">{title}</p>
      {summary.detail && <p className="mt-[0.25em] whitespace-pre-line">{summary.detail}</p>}
      {summary.bullets.length > 0 && (
        <ul className="mt-[0.25em] list-disc pl-[1.1em]">
          {summary.bullets.map((bullet, index) => (
            <li key={index}>{bullet}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
