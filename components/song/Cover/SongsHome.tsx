import { ClientTagGroup } from "@/prisma/models";
import CategoryTile from "./CategoryTile";

/** Largura do card nas telas maiores: igual na grade (destaque) e na prateleira. */
const TILE_W = "sm:w-[180px]";

type SongsHomeProps = { tagGroups: ClientTagGroup[] };

function Section({ group, children }: { group: ClientTagGroup; children: React.ReactNode }) {
  return (
    <section className="mb-8 mt-6">
      <h2 className="flex items-center gap-2 font-display text-xl font-semibold leading-tight tracking-tight text-primary">
        {group.name}
        {group.isProposed && (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-px font-sans text-[11px] font-semibold text-amber-700">
            em construção
          </span>
        )}
      </h2>
      {group.description && <p className="mt-0.5 text-sm text-muted-foreground">{group.description}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

/**
 * Home de Músicas: os grupos "destaque" em grade e os "prateleira" numa linha com rolagem
 * lateral. Grupos "filtro" não aparecem aqui; grupo sem músicas classificadas some.
 */
export default function SongsHome({ tagGroups }: SongsHomeProps) {
  const withSongs = (g: ClientTagGroup) => g.tags.filter((t) => (t.songCount ?? 0) > 0);
  const featured = tagGroups.filter((g) => g.presentation === "FEATURED" && withSongs(g).length > 0);
  const shelves = tagGroups.filter((g) => g.presentation === "SHELF" && withSongs(g).length > 0);

  const tile = (g: ClientTagGroup, t: ClientTagGroup["tags"][number], className?: string) => (
    <CategoryTile
      key={t.id}
      tagId={t.id}
      name={t.name}
      color={t.color ?? g.color}
      songCount={t.songCount ?? 0}
      className={className}
    />
  );

  return (
    <>
      {featured.map((g) => (
        <Section key={g.id} group={g}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fill,180px)]">
            {withSongs(g).map((t) => tile(g, t))}
          </div>
        </Section>
      ))}
      {shelves.map((g) => (
        <Section key={g.id} group={g}>
          <div className="no-scrollbar -mx-5 flex snap-x snap-proximity scroll-px-5 gap-3 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:scroll-px-8 sm:px-8 lg:-mx-14 lg:scroll-px-14 lg:px-14">
            {withSongs(g).map((t) => tile(g, t, `w-[160px] shrink-0 snap-start ${TILE_W}`))}
          </div>
        </Section>
      ))}
      <h2 className="mb-3 mt-5 font-display text-xl font-semibold leading-tight tracking-tight text-primary">
        Todas as músicas
      </h2>
    </>
  );
}
