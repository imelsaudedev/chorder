"use client";

import { useFetchArrangement } from "#api-client";
import Main from "@/components/common/Main";
import SongConfigProvider, {
  useSongConfig,
} from "@/components/config/SongConfig";
import ArrangementHeader from "@/components/song/ArrangementHeader";
import ArrangementView, { ArrangementViewHandle } from "@/components/song/ArrangementView";
import SongMap from "@/components/song/SongMap";
import { useRef } from "react";

type ClientPageProps = { songSlug: string; arrangementId?: number };
export default function ClientPage({
  songSlug,
  arrangementId,
}: ClientPageProps) {
  const { arrangement } = useFetchArrangement(songSlug, arrangementId);
  const viewRef = useRef<ArrangementViewHandle>(null);

  return (
    <SongConfigProvider>
      <ArrangementHeader arrangement={arrangement} />
      <MainWithDensity>
        {arrangement?.units && (
          <SongMap
            units={arrangement.units}
            onSelectUnit={(index) => viewRef.current?.selectUnit(index)}
            className="mb-4"
          />
        )}
        <ArrangementView ref={viewRef} arrangement={arrangement} collapsible />
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
