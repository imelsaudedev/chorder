"use client";

import { useFetchArrangement } from "#api-client";
import Main from "@/components/common/Main";
import SongConfigProvider, {
  useSongConfig,
} from "@/components/config/SongConfig";
import ArrangementHeader from "@/components/song/ArrangementHeader";
import ArrangementView, { ArrangementViewHandle } from "@/components/song/ArrangementView";
import SongMap from "@/components/song/SongMap";
import { ClientArrangement } from "@/prisma/models";
import { useRef } from "react";

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
        <ArrangementBody arrangement={arrangement} />
      </MainWithDensity>
    </SongConfigProvider>
  );
}

// Mapa da música + cifra. O espaçamento segue o vão entre blocos da cifra
// (--block-gap de ArrangementView: 1em normal / 0.5em compacto, na fonte da
// cifra): 2× entre o título e o mapa, 1× entre o mapa e a cifra.
function ArrangementBody({ arrangement }: { arrangement: ClientArrangement | null }) {
  const { fontSize, density } = useSongConfig();
  const viewRef = useRef<ArrangementViewHandle>(null);
  const blockGap = (density === "compact" ? 0.5 : 1) * fontSize;

  return (
    <div style={{ paddingTop: blockGap * 2 }}>
      {arrangement?.units && arrangement.units.length > 0 && (
        <div style={{ marginBottom: blockGap }}>
          <SongMap
            units={arrangement.units}
            onSelectUnit={(index) => viewRef.current?.selectUnit(index)}
          />
        </div>
      )}
      <ArrangementView ref={viewRef} arrangement={arrangement} collapsible />
    </div>
  );
}

function MainWithDensity({ children }: { children: React.ReactNode }) {
  const { density } = useSongConfig();

  // Sem padding no topo: o espaço entre o título e o mapa é o vão de ArrangementBody.
  return (
    <Main density={density} className="px-4 sm:px-5 lg:px-8 pb-4 sm:pb-5 lg:pb-8">
      {children}
    </Main>
  );
}
