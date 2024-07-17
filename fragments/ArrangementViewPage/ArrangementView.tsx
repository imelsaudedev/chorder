import { useMemo } from 'react';
import ColumnViewer from './ColumnViewer';
import { parseChordPro } from '@/chopro/music';
import { SongUnit } from '@/models/song-unit';
import { Mode } from '@/components/ModeButtonSet';

type ArrangementViewProps = {
  songUnitMap: SongUnit[];
  songKey: string | undefined;
  columns?: number;
  transpose?: number;
  mode?: Mode;
};

export default function ArrangementView({
  songUnitMap,
  songKey,
  columns = 1,
  transpose = 0,
  mode = 'chords',
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

  return <ColumnViewer columns={columns} lineData={lineData} transpose={transpose} originalKey={songKey} mode={mode} />;
}
