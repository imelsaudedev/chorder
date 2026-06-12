import { useSongConfig } from "@/components/config/SongConfig";
import { ClientArrangement } from "@/prisma/models";
import ColumnViewer from "./ColumnViewer";
import Skeleton from "./Skeleton";

type ArrangementViewProps = {
  arrangement: ClientArrangement | null;
};
export default function ArrangementView({ arrangement }: ArrangementViewProps) {
  const { density, fontSize, columns, transpose, mode, enharmonicPreference } = useSongConfig();

  if (!arrangement) {
    return <Skeleton density={density} />;
  }

  const isCompact = density === "compact";

  return (
    <div
      style={{
        fontSize: `${fontSize}px`,
        "--block-gap": isCompact ? "0.5em" : "1em",
        "--block-px":  isCompact ? "0.5em" : "1em",
        "--block-pt":  isCompact ? "0.25em" : "0.5em",
        "--item-mb":   isCompact ? "0.375em" : "0.5em",
      } as React.CSSProperties}
    >
      <ColumnViewer
        columns={columns}
        songUnits={arrangement.units!}
        transpose={transpose}
        originalKey={arrangement.key}
        enharmonicPreference={enharmonicPreference}
        mode={mode}
        density={density}
      />
    </div>
  );
}
