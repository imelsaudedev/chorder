export const dynamic = "force-dynamic";

import AccessDeniedView from "@/components/auth/AccessDeniedView";
import PageTitleBlock from "@/components/common/PageTitleBlock";
import Main from "@/components/common/Main";
import StatsView from "@/components/stats/StatsView";
import { getLiveUserAuth } from "@/lib/auth-guard";
import { canAccessAdmin } from "@/lib/permissions";
import { retrieveStats } from "@/prisma/data";
import { redirect } from "next/navigation";

/** Estatísticas de uso: só Admin (o servidor decide; a tela não é a trava). */
export default async function StatsPage() {
  const live = await getLiveUserAuth();
  if (!live.authenticated) redirect("/login?callbackUrl=%2Fstats");
  if (!canAccessAdmin(live.roles)) return <AccessDeniedView />;

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
