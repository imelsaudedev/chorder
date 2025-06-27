import { ClientArrangement } from "@/prisma/models";
import ColumnViewer from "./ColumnViewer";
import { useSongConfig } from "@/components/config/SongConfig";
import Skeleton from "./Skeleton";

type ArrangementViewerProps = {
  arrangement: ClientArrangement | null;
};
export default function ArrangementViewer({
  arrangement,
}: ArrangementViewerProps) {
  const { density, fontSize, columns, transpose, mode } = useSongConfig();

  if (!arrangement) {
    return <Skeleton density={density} />;
  }

  return (
    <div style={{ fontSize: `${fontSize}px` }}>
      <ColumnViewer
        columns={columns}
        songUnits={arrangement.units!}
        transpose={transpose}
        originalKey={arrangement.key}
        mode={mode}
        density={density}
      />
    </div>
  );
}
