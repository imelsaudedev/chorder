import { useSongConfig } from "@/components/config/SongConfig";
import { ClientArrangement } from "@/prisma/models";
import ColumnViewer from "./ColumnViewer";
import Skeleton from "./Skeleton";

type ArrangementViewProps = {
  arrangement: ClientArrangement | null;
};
export default function ArrangementView({ arrangement }: ArrangementViewProps) {
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
