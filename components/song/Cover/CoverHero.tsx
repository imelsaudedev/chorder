import { coverFromColor } from "@/lib/cover-theme";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

type CoverHeroProps = {
  groupName: string;
  name: string;
  description?: string | null;
  color: string;
  backHref: string;
};

/**
 * Capa da página de uma categoria: largura total, só de cor. O "Voltar" e todos os textos
 * usam uma tinta só, escolhida pelo contraste (lib/cover-theme.ts).
 */
export default function CoverHero({ groupName, name, description, color, backHref }: CoverHeroProps) {
  const { theme, background } = coverFromColor(color);
  const shadow = theme.light ? { textShadow: "0 1px 3px rgba(0,0,0,.35)" } : undefined;
  return (
    <div
      className="relative isolate -mx-5 mb-6 flex h-[164px] flex-col justify-end overflow-hidden px-5 py-4 sm:-mx-8 sm:h-[180px] sm:px-8 lg:-mx-14 lg:h-[208px] lg:px-14 lg:py-6"
      style={{ background, color: theme.ink }}
    >
      <span
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{ background: `linear-gradient(to top, ${theme.scrimBottom}, ${theme.scrimTop})` }}
      />
      <Link
        href={backHref}
        className="absolute left-5 top-4 -ml-1.5 inline-flex h-8 items-center gap-0.5 rounded pr-1 text-sm font-medium hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 sm:left-8 lg:left-14 lg:top-6"
        style={shadow}
        aria-label="Voltar para Músicas"
      >
        <ChevronLeft className="size-[18px]" /> Músicas
      </Link>
      <span className="text-xs font-semibold uppercase tracking-wider opacity-90" style={shadow}>
        {groupName}
      </span>
      <h1
        className="max-w-full truncate font-display text-[30px] font-semibold leading-[1.1] tracking-[-0.05em] sm:text-4xl lg:text-[44px]"
        style={shadow}
      >
        {name}
      </h1>
      {description && (
        <p className="max-w-full text-sm opacity-95" style={shadow}>
          {description}
        </p>
      )}
    </div>
  );
}
