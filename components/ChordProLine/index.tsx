import { Line } from 'chordsheetjs';
import styles from './styles.module.scss';
import { unitTypeColorClasses } from '../unit-colors';
import { transposeChord } from '@/chopro/music';
import { SongUnitType } from '@/models/song-unit';

type ChordProLineProps = {
  line: Line;
  isFirst: boolean;
  isLast: boolean;
  isLastOfColumn?: boolean;
  unitType?: SongUnitType;
  originalKey?: string;
  transpose?: number;
  grow?: boolean;
};

export default function ChordProLine({
  line,
  isFirst,
  isLast,
  isLastOfColumn,
  unitType,
  originalKey,
  transpose,
  grow,
}: ChordProLineProps) {
  const hasLyrics = line.items.some((item) => (item as any).lyrics?.trim());
  const hasChords = line.items.some((item) => (item as any).chords?.trim());
  let className = 'flex flex-col relative px-2 border-x';
  if (unitType) {
    const unitClasses = unitTypeColorClasses[unitType];
    className = `${className} ${unitClasses.background} ${unitClasses.border}`;

    if (isFirst) {
      className = `${className} pt-1 border-t rounded-t`;
    }
    if (isLast) {
      className = `${className} border-b rounded-b`;
      if (!isLastOfColumn) {
        className = `${className} mb-2`;
      }
    }
    if (grow) {
      className = `${className} flex-grow`;
    }
  }
  return (
    <div className={className} style={{ breakInside: 'avoid' }}>
      <div className="flex flex-row flex-wrap">
        {line.items.length === 0 && <br />}
        {line.items.map((item, elementIdx) => (
          <ChordProItem
            item={item}
            hasLyrics={hasLyrics}
            hasChords={hasChords}
            originalKey={originalKey}
            transpose={transpose}
            key={`song-line-item-${elementIdx}`}
            isConnection={isConnection(line.items, elementIdx)}
          />
        ))}
      </div>
      {grow && <div className="flex-grow" />}
    </div>
  );
}

function ChordProItem({
  originalKey,
  hasLyrics,
  hasChords,
  item,
  isConnection,
  transpose,
}: {
  originalKey?: string;
  hasLyrics: boolean;
  hasChords: boolean;
  item: any;
  isConnection: boolean;
  transpose?: number;
}) {
  if (item._name === 'comment') {
    return <span className="italic">{item._value}</span>;
  }

  const chordClasses = ['mr-1', 'text-[0.9em]', 'text-secondary', 'leading-none', 'font-bold', 'mb-0'];
  if (hasChords) {
    chordClasses.push('h-[1em]');
  }

  const lyricsClasses = ['leading-none', 'text-[1em]', styles.lyrics];
  if (isConnection) {
    lyricsClasses.push(styles.lyricsConnection);
  }
  if (hasLyrics) {
    lyricsClasses.push('h-[1em]');
  }

  return (
    <div className={'flex flex-col whitespace-pre-wrap mb-2'}>
      <span className={chordClasses.join(' ')}>
        {transpose && originalKey ? transposeChord(item.chords, originalKey, transpose) : item.chords}
      </span>
      <span className={lyricsClasses.join(' ')}>{item.lyrics || ' '}</span>
    </div>
  );
}

function isConnection(items: any, itemIdx: number) {
  if (itemIdx === items.length - 1) {
    return false;
  }

  const currentItem = items[itemIdx];
  const nextItem = items[itemIdx + 1];
  if (currentItem._name === 'comment' || nextItem._name === 'comment') {
    return false;
  }
  return currentItem.lyrics?.trim() && nextItem.lyrics?.trim();
}
