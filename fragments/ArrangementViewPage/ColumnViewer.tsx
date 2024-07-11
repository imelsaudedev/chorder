import ChordProLine from '@/components/ChordProLine';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { SongUnitType } from '@/models/song-unit';
import { Line } from 'chordsheetjs';
import { useEffect, useState } from 'react';

type ColumnViewerProps = {
  columns: number;
  lineData: (LineData | null)[];
  transpose: number;
  originalKey?: string;
};

type LineData = {
  line: Line;
  unitType: SongUnitType;
  isFirst: boolean;
  isLast: boolean;
};

export default function ColumnViewer({ columns: columnConfig, lineData, transpose, originalKey }: ColumnViewerProps) {
  const [columns, setColumns] = useState(columnConfig);

  const isPhone = useMediaQuery('(max-width: 639px)');
  const isTablet = useMediaQuery('(max-width: 1023px)');
  const isDesktop = useMediaQuery('(max-width: 1279px)');
  useEffect(() => {
    if (columnConfig === 0) {
      if (isPhone) {
        setColumns(1);
      } else if (isTablet) {
        setColumns(2);
      } else if (isDesktop) {
        setColumns(3);
      } else {
        setColumns(4);
      }
    } else {
      setColumns(columnConfig);
    }
  }, [columnConfig, isDesktop, isPhone, isTablet]);

  let gridCols;
  if (columns <= 1) {
    gridCols = 'grid-cols-1';
  }
  if (columns === 2) {
    gridCols = 'grid-cols-2';
  }
  if (columns === 3) {
    gridCols = 'grid-cols-3';
  }
  if (columns >= 4) {
    gridCols = 'grid-cols-4';
  }
  const className = `grid ${gridCols} gap-4`;

  return (
    <div className={className}>
      {Array.from(Array(columns).keys()).map((i) => {
        const linesPerColumn = Math.ceil(lineData.length / columns);
        const colData = lineData.slice(i * linesPerColumn, Math.min((i + 1) * linesPerColumn, lineData.length));
        return (
          <div key={`col-${i}`} className="flex flex-col">
            {colData.map((data, idx) =>
              data ? (
                <ChordProLine
                  key={`col-${i}-line-${idx}`}
                  line={data.line}
                  unitType={data.unitType}
                  isFirst={data.isFirst}
                  isLast={data.isLast}
                  isLastOfColumn={idx === colData.length - 1}
                  grow={idx === colData.length - 1}
                  originalKey={originalKey}
                  transpose={transpose}
                />
              ) : (
                <span key={`col-${i}-line-${idx}`}>ERROR</span>
              )
            )}
          </div>
        );
      })}
    </div>
  );
}
