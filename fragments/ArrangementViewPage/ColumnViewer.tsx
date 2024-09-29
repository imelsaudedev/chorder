import ChordProLine from '@/components/ChordProLine';
import { Mode } from '@/components/ModeButtonSet';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { SongUnit } from '@/models/song-unit';
import { useEffect, useMemo, useState } from 'react';
import { findBestDistribution } from './column-logic';
import { unitTypeColorClasses } from '@/components/unit-colors';

type ColumnViewerProps = {
  columns: number;
  songUnitMap: SongUnit[];
  transpose: number;
  originalKey?: string;
  mode: Mode;
};

export default function ColumnViewer({
  columns: columnConfig,
  songUnitMap,
  transpose,
  originalKey,
  mode,
}: ColumnViewerProps) {
  const [columns, setColumns] = useState(columnConfig);

  const columnData = useMemo(() => findBestDistribution(songUnitMap, columns), [songUnitMap, columns]);

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

  return (
    <div className={`grid ${gridCols} gap-4`}>
      {columnData.map((data, idx) => {
        return (
          <div key={`col-${idx}`} className="flex flex-col gap-2">
            {data.map((unit, unitIdx) => {
              const unitClasses = unitTypeColorClasses[unit.unitType];
              let className = `border rounded pt-1 ${unitClasses.background} ${unitClasses.border}`;
              className = `${className} ${unitIdx === data.length - 1 ? 'flex-grow' : ''}`;

              return (
                <div key={`unit-${unitIdx}`} className={className}>
                  {unit.lines.map((line, idx) => (
                    <ChordProLine
                      key={`unit-${unitIdx}-line-${idx}`}
                      line={line}
                      originalKey={originalKey}
                      transpose={transpose}
                      mode={mode}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
