import Tag from "@/components/common/Tag";
import Text from "@/components/common/Text";
import { LeaderStat, SongStat, StatsData } from "@/prisma/models";

type StatsViewProps = { stats: StatsData };

export default function StatsView({ stats }: StatsViewProps) {
  return (
    <div className="pb-16 space-y-10">
      {/* Card resumo */}
      <div className="inline-flex flex-col gap-1 rounded-xl border border-border bg-muted/30 px-6 py-4">
        <Text variant="overline" as="p">repertório</Text>
        <Text variant="heading-sm" as="p" className="text-3xl font-bold tabular-nums">
          {stats.totalSongs}
          <span className="text-base font-normal text-muted-foreground ml-2">músicas</span>
        </Text>
      </div>

      {/* Ranking global */}
      <section>
        <Text variant="heading-sm" as="h2" className="mb-4">Músicas mais cantadas</Text>
        <SongRanking songs={stats.topSongs} />
      </section>

      {/* Por dirigente */}
      <section>
        <Text variant="heading-sm" as="h2" className="mb-4">Por dirigente</Text>
        <div className="space-y-6">
          {stats.byLeader.map((leader) => (
            <LeaderCard key={leader.name} leader={leader} />
          ))}
        </div>
      </section>
    </div>
  );
}

function SongRanking({ songs }: { songs: SongStat[] }) {
  if (songs.length === 0) {
    return <Text variant="caption" as="p">Nenhum dado disponível.</Text>;
  }
  return (
    <ol className="divide-y divide-border rounded-lg border border-border overflow-hidden">
      {songs.map((song, i) => (
        <li key={song.slug} className="flex items-center gap-3 px-4 py-2.5 bg-background hover:bg-muted/40 transition-colors">
          <Text variant="caption" as="span" className="w-6 text-right shrink-0 tabular-nums">
            {i + 1}
          </Text>
          <Text variant="label" as="span" className="flex-1 truncate text-sm">{song.title}</Text>
          <Tag variant="muted" size="xs" label={`${song.count}×`} className="shrink-0 tabular-nums" />
        </li>
      ))}
    </ol>
  );
}

function LeaderCard({ leader }: { leader: LeaderStat }) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-muted/30 border-b border-border">
        <Text variant="heading-sm" as="h3" className="flex-1">{leader.name}</Text>
        <Tag variant="muted" size="xs" label={`${leader.totalServices} liturgia${leader.totalServices !== 1 ? "s" : ""}`} />
      </div>
      <ol className="divide-y divide-border">
        {leader.topSongs.map((song, i) => (
          <li key={song.slug} className="flex items-center gap-3 px-4 py-2 bg-background">
            <Text variant="caption" as="span" className="w-5 text-right shrink-0 tabular-nums">
              {i + 1}
            </Text>
            <Text variant="label" as="span" className="flex-1 truncate text-sm">{song.title}</Text>
            <Tag variant="muted" size="xs" label={`${song.count}×`} className="shrink-0 tabular-nums" />
          </li>
        ))}
      </ol>
    </div>
  );
}
