"use client";

import { useFetchArrangement } from "#api-client";
import Main from "@/components/common/Main";
import SongConfigProvider, {
  useSongConfig,
} from "@/components/config/SongConfig";
import ArrangementHeader from "@/components/song/ArrangementHeader";
import ArrangementView from "@/components/song/ArrangementView";

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
    <Main density={density} className="px-4 sm:px-5 lg:px-8 py-4 sm:py-5 lg:py-8">
      {children}
    </Main>
  );
}
