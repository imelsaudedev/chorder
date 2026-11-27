import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type LeaderPerson = { userId: string | null; name: string; image: string | null };

const initialsOf = (name: string) => {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
};

const SIZE = 20; // px (size-5)
const OVERLAP = 6; // px (-space-x-1.5)
const GAP = 2; // folga entre as fotos sobrepostas

/**
 * Recorte do avatar de baixo no formato do avatar de cima (que está à esquerda), com uma folga.
 * Separa as fotos sem anel colorido: o anel precisava da cor do fundo (errada no cabeçalho do
 * editor, que é tingido) e, por ficar fora do avatar, era cortado pelo `overflow-hidden` do cabeçalho.
 */
const CUT = `radial-gradient(circle ${SIZE / 2 + GAP}px at ${-(SIZE - OVERLAP) + SIZE / 2}px ${SIZE / 2}px, transparent calc(100% - 0.5px), #000 100%)`;

/**
 * Foto de quem conduz, ao lado do nome (sem chip), na lista e nos cabeçalhos da liturgia.
 * 20px: cabe nos 22px da linha da lista e fica na escala dos ícones de 14 a 16px ao lado.
 * Com mais de uma pessoa, as fotos se sobrepõem (até 3), a primeira por cima. Decorativo: o nome vem em texto ao lado.
 */
export default function LeaderAvatars({ people, className }: { people: LeaderPerson[]; className?: string }) {
  return (
    <span className={cn("flex shrink-0 -space-x-1.5", className)} aria-hidden>
      {people.slice(0, 3).map((p, i, shown) => (
        <Avatar
          key={`${p.name}-${i}`}
          className="size-5"
          // o primeiro fica por cima do segundo, e assim por diante (por padrão o último ficaria por cima)
          style={{ zIndex: shown.length - i, ...(i > 0 ? { WebkitMaskImage: CUT, maskImage: CUT } : null) }}
        >
          {p.image && <AvatarImage src={p.image} alt="" />}
          <AvatarFallback className="bg-secondary/15 text-[9px] font-medium text-secondary">
            {initialsOf(p.name)}
          </AvatarFallback>
        </Avatar>
      ))}
    </span>
  );
}
