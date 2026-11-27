import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type LeaderPerson = { userId: string | null; name: string; image: string | null };

const initialsOf = (name: string) => {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
};

/**
 * Foto de quem conduz, ao lado do nome (sem chip), na lista e no cabeçalho da liturgia.
 * 20px: cabe nos 22px da linha da lista e fica na escala dos ícones de 14 a 16px ao lado.
 * Com mais de uma pessoa, as fotos se sobrepõem (até 3), a primeira por cima. Decorativo: o nome vem em texto ao lado.
 */
export default function LeaderAvatars({ people, className }: { people: LeaderPerson[]; className?: string }) {
  return (
    <span className={cn("flex shrink-0 -space-x-1.5", className)} aria-hidden>
      {people.slice(0, 3).map((p, i, shown) => (
        // o primeiro fica por cima do segundo, e assim por diante (por padrão o último ficaria por cima)
        <Avatar key={`${p.name}-${i}`} className="size-5 ring-2 ring-background" style={{ zIndex: shown.length - i }}>
          {p.image && <AvatarImage src={p.image} alt="" />}
          <AvatarFallback className="bg-secondary/15 text-[9px] font-medium text-secondary">
            {initialsOf(p.name)}
          </AvatarFallback>
        </Avatar>
      ))}
    </span>
  );
}
