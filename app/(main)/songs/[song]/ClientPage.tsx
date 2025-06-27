"use client";

import Main from "@/components/common/Main";
import ArrangementView from "@/components/song/ArrangementView";
import ArrangementHeader from "@/components/song/ArrangementHeader";
import SongConfigProvider, {
  useSongConfig,
} from "@/components/config/SongConfig";
import { useFetchArrangement } from "@/app/api/api-client";

type ClientPageProps = { songSlug: string; arrangementId?: number };
export default function ClientPage({
  songSlug,
  arrangementId,
}: ClientPageProps) {
  const { arrangement } = useFetchArrangement(songSlug, arrangementId);

  return (
    <SongConfigProvider>
      <ArrangementHeader arrangement={arrangement} />
      <MainWithDensity>
        <ArrangementView arrangement={arrangement} />
      </MainWithDensity>
    </SongConfigProvider>
  );
}

function MainWithDensity({ children }: { children: React.ReactNode }) {
  const { density } = useSongConfig();

  return (
    <Main density={density} className="py-4 sm:py-6 lg:py-8">
      {children}
    </Main>
  );
}
