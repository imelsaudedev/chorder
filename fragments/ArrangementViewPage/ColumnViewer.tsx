import ChordProLine from '@/components/ChordProLine';
import { SongUnitType } from '@/models/song-unit';
import { Line } from 'chordsheetjs';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

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
  const container = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(columnConfig);
  const [containerWidth, setContainerWidth] = useState(630);
  useEffect(() => {
    if (columnConfig === 0) {
      if (containerWidth < 640) {
        setColumns(1);
      } else if (containerWidth < 1024) {
        setColumns(2);
      } else if (containerWidth < 1280) {
        setColumns(3);
      } else {
        setColumns(4);
      }
    } else {
      setColumns(columnConfig);
    }
  }, [columnConfig, containerWidth]);

  const ResizeObserver = dynamic(() => import('./ResizeObserver'), {
    ssr: false,
  });
  const handleResize = (width: number, height: number) => {
    setContainerWidth(width);
  };

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
    <div ref={container} className={className}>
      <ResizeObserver target={container} onResize={handleResize} />
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
