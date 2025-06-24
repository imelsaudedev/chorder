import { useMemo } from "react";
import ColumnViewer from "./ColumnViewer";
import { parseChordPro } from "@/chopro/music";
import { SongUnit } from "@/models/song-unit";
import { Mode } from "@/components-old/ModeButtonSet";

type ArrangementViewProps = {
  songUnitMap: SongUnit[];
  songKey: string | undefined;
  columns?: number;
  transpose?: number;
  mode?: Mode;
  density: "compact" | "normal";
};

export default function ArrangementView({
  songUnitMap,
  songKey,
  columns = 1,
  transpose = 0,
  mode = "chords",
  density,
}: ArrangementViewProps) {
  const lineData = useMemo(() => {
    return songUnitMap
      ?.map((unit) => {
        const chordproHtml = parseChordPro(unit.content);
        return chordproHtml.lines.map((line, idx) => ({
          line,
          unitType: unit.type,
          isFirst: idx === 0,
          isLast: idx === chordproHtml.lines.length - 1,
        }));
      })
      .flat();
  }, [songUnitMap]);

  return (
    <ColumnViewer
      columns={columns}
      songUnitMap={songUnitMap}
      transpose={transpose}
      originalKey={songKey}
      mode={mode}
      density={density}
    />
  );
}
