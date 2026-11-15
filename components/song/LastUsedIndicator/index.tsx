import { formatTimeAgo, formatTimeAgoShort } from "@/lib/relative-time";
import { History } from "lucide-react";

// Indicador discreto de "última vez usada": ícone + texto curto, colorido numa
// escala do quente (usada há pouco) ao frio (há muito tempo). As cores partem
// dos tokens do tema (accent = quente, ring = frio) misturados com a cor do
// texto, o que mantém o contraste tanto no claro quanto no escuro.
const TONES = [
  // Quente: até 2 semanas
  { maxDays: 14, className: "text-[color-mix(in_srgb,var(--accent)_62%,var(--foreground))]" },
  // Morno: até 2 meses
  { maxDays: 60, className: "text-[color-mix(in_srgb,var(--accent)_28%,var(--muted-foreground))]" },
  // Fresco: até 1 ano
  { maxDays: 365, className: "text-[color-mix(in_srgb,var(--ring)_40%,var(--muted-foreground))]" },
  // Frio: mais de 1 ano
  { maxDays: Infinity, className: "text-[color-mix(in_srgb,var(--ring)_62%,var(--foreground))]" },
];

export default function LastUsedIndicator({
  date,
  className = "",
}: {
  date: Date | string;
  className?: string;
}) {
  const then = typeof date === "string" ? new Date(date) : date;
  const days = Math.max(0, Math.floor((Date.now() - then.getTime()) / 86_400_000));
  const tone = TONES.find((t) => days <= t.maxDays) ?? TONES[TONES.length - 1];

  return (
    <span
      title={`Última vez usada ${formatTimeAgo(then)}`}
      className={`inline-flex h-4 items-center gap-1 whitespace-nowrap text-xs leading-4 tabular-nums ${tone.className} ${className}`}
    >
      <History className="w-3.5 h-3.5" aria-hidden="true" />
      <span className="sr-only">Última vez usada {formatTimeAgo(then)}</span>
      <span aria-hidden="true">{formatTimeAgoShort(then)}</span>
    </span>
  );
}
