"use client";

import { summarizeUnit } from "@/components/service/ServicePlanEditor/unitSummary";
import { ClientServiceUnit } from "@/prisma/models";

const TYPE_LABELS: Record<string, string> = {
  FALA: "Fala",
  ORACAO: "Oração",
  LEITURA: "Leitura",
  AVISOS: "Avisos",
  SERMAO: "Sermão",
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
  /** Mesma fonte dos blocos da cifra — o corpo do item segue o tamanho escolhido. */
  fontSize: number;
};

/**
 * Item do roteiro que não é música (fala, oração, leitura, avisos, sermão),
 * mostrado no Modo Palco entre as músicas quando "Exibir roteiro" está ligado.
 * Caixa cinza de cantos arredondados; sem conteúdo vira uma linha compacta.
 */
export default function StageRoteiroItem({ unit, fontSize }: StageRoteiroItemProps) {
  const type = roteiroTypeLabel(unit);
  const summary = summarizeUnit(unit, type);
  const title = summary.title ?? type;
  const meta = roteiroMeta(unit);
  const hasBody = !!summary.detail || summary.bullets.length > 0;
  const small = "text-[0.62em] font-bold uppercase tracking-wider text-muted-foreground";

  if (!hasBody) {
    return (
      <div
        style={{ fontSize }}
        className="my-3 flex items-baseline gap-[0.6em] rounded-2xl bg-muted px-[0.9em] py-[0.5em] leading-snug"
      >
        <span className={small}>{type}</span>
        <span className="min-w-0 flex-1 font-semibold">{title}</span>
        {meta && <span className={`${small} whitespace-nowrap`}>{meta}</span>}
      </div>
    );
  }

  return (
    <div style={{ fontSize }} className="my-3 rounded-2xl bg-muted px-[0.9em] py-[0.7em] leading-snug">
      <div className={`flex items-baseline justify-between gap-2 ${small}`}>
        <span>{type}</span>
        {meta && <span className="text-right">{meta}</span>}
      </div>
      <p className="mt-[0.15em] font-semibold">{title}</p>
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
