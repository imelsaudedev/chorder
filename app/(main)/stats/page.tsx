import Heading from "@/components/common/Heading";
import Main from "@/components/common/Main";
import StatsView from "@/components/stats/StatsView";
import { retrieveStats } from "@/prisma/data";

export default async function StatsPage() {
  const stats = await retrieveStats();

  return (
    <>
      <div className="px-5 sm:px-8 lg:px-14 pt-6 sm:pt-8 pb-4 sm:pb-6 lg:pb-8">
        <Heading level={1}>Estatísticas</Heading>
      </div>
      <Main>
        <StatsView stats={stats} />
      </Main>
    </>
  );
}
