import { coverFromColor } from "@/lib/cover-theme";
import { Music2 } from "lucide-react";
import Link from "next/link";

type FeaturedCardProps = {
  tagId: number;
  name: string;
  description?: string | null;
  color: string;
  imageUrl?: string | null;
  songCount: number;
};

/**
 * Card de uma categoria em destaque (estilo "card with image" do Flowbite): imagem em cima
 * e o texto embaixo, sobre fundo neutro — por isso não depende de contraste com a imagem.
 * Sem imagem, o topo é a cor da categoria.
 */
export default function FeaturedCard({ tagId, name, description, color, imageUrl, songCount }: FeaturedCardProps) {
  const { background } = coverFromColor(color);
  return (
    <Link
      href={`/songs/categoria/${tagId}`}
      className="group block overflow-hidden rounded-lg border bg-background shadow-xs transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <div className="relative aspect-[16/9] w-full" style={{ background }}>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
        ) : (
          <Music2 aria-hidden className="absolute bottom-2 right-2 size-6 text-white/50" />
        )}
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="truncate font-display text-base font-semibold leading-5 tracking-tight text-primary">{name}</h3>
        {description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{description}</p>}
        <p className="mt-2 text-xs font-medium text-muted-foreground">
          {songCount} música{songCount === 1 ? "" : "s"}
        </p>
      </div>
    </Link>
  );
}
