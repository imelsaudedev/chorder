import PageTitleBlock from "@/components/common/PageTitleBlock";
import Main from "@/components/common/Main";
import StatsView from "@/components/stats/StatsView";
import { retrieveStats } from "@/prisma/data";

export default async function StatsPage() {
  const stats = await retrieveStats();

  return (
    <>
      <PageTitleBlock title="Estatísticas" />
      <Main>
        <StatsView stats={stats} />
      </Main>
    </>
  );
}
