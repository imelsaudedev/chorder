import Section from "@/components/common/Section";
import { ClientTagGroup } from "@/prisma/models";
import CategoryTile from "./CategoryTile";
import FeaturedCard from "./FeaturedCard";

type SongsHomeProps = { tagGroups: ClientTagGroup[] };

function GroupSection({ group, children }: { group: ClientTagGroup; children: React.ReactNode }) {
  return (
    <Section
      title={group.name}
      description={group.description}
      aside={
        group.isProposed ? (
          <span className="rounded-full border border-warning-border bg-warning-subtle px-2 py-px font-sans text-[11px] font-semibold text-warning-text">
            em construção
          </span>
        ) : undefined
      }
    >
      {children}
    </Section>
  );
}

/**
 * Home de Músicas: os grupos "destaque" em grade de cards com imagem (FeaturedCard) e os "prateleira" numa linha com rolagem
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
        <GroupSection key={g.id} group={g}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(200px,240px))]">
            {withSongs(g).map((t) => (
              <FeaturedCard
                key={t.id}
                tagId={t.id}
                name={t.name}
                description={t.description}
                color={t.color ?? g.color}
                imageUrl={t.imageUrl}
                songCount={t.songCount ?? 0}
              />
            ))}
          </div>
        </GroupSection>
      ))}
      {shelves.map((g) => (
        <GroupSection key={g.id} group={g}>
          <div className="no-scrollbar -mx-page flex snap-x snap-proximity scroll-px-page gap-3 overflow-x-auto px-page pb-2">
            {withSongs(g).map((t) => tile(g, t, "w-[160px] shrink-0 snap-start sm:w-[180px]"))}
          </div>
        </GroupSection>
      ))}
      {/* mb-2 + py-2 da barra de filtros = os 16px do padrão entre o h2 e o conteúdo */}
      <Section title="Todas as músicas" className="mb-2" />
    </>
  );
}
