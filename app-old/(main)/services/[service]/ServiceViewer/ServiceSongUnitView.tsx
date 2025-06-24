import ArrangementViewer from "@/app-old/(main)/songs/ArrangementViewer";
import ArrangementViewContext from "@/app-old/(main)/songs/ArrangementViewer/ArrangementViewContext";

import { ServiceSongUnit } from "@/prisma/models";
import ServiceArrangementHeader from "./ServiceArrangementHeader";
import {
  useColumns,
  useDensity,
  useFontSize,
  useMode,
} from "./ServiceViewContext";

type ServiceSongUnitViewProps = {
  unit: ServiceSongUnit;
  order: number;
};

export default function ServiceSongUnitView({
  unit,
  order,
}: ServiceSongUnitViewProps) {
  const arrangementId = unit.arrangementId;
  const { columns } = useColumns();
  const { fontSize } = useFontSize();
  const { mode } = useMode();
  const { density } = useDensity();

  return (
    <div className="w-full">
      <ArrangementViewContext
        arrangementId={arrangementId}
        transpose={unit.semitoneTranspose}
        columns={columns}
        fontSize={fontSize}
        mode={mode}
        density={density}
      >
        <ServiceArrangementHeader order={order} />
        <ArrangementViewer />
      </ArrangementViewContext>
    </div>
  );
}
