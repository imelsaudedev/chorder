import { useServiceConfig } from "@/components/config/ServiceConfig";
import SongConfigProvider from "@/components/config/SongConfig";
import ArrangementView from "@/components/song/ArrangementView";
import { ClientServiceSongUnit } from "@/prisma/models";
import ServiceArrangementHeader from "./ServiceArrangementHeader";

type ServiceSongUnitViewProps = {
  unit: ClientServiceSongUnit;
};

export default function ServiceSongUnitView({
  unit,
}: ServiceSongUnitViewProps) {
  const arrangement = unit.arrangement;
  const { columns, fontSize, mode, density } = useServiceConfig();

  if (!arrangement) {
    throw new Error("Arrangement is not available for this unit");
  }

  return (
    <div className="w-full">
      <SongConfigProvider
        transpose={unit.semitoneTranspose}
        columns={columns}
        fontSize={fontSize}
        mode={mode}
        density={density}
      >
        <ServiceArrangementHeader
          arrangement={arrangement}
          order={unit.order}
        />
        <ArrangementView arrangement={arrangement} />
      </SongConfigProvider>
    </div>
  );
}
