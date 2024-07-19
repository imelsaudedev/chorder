import { Line } from 'chordsheetjs';
import styles from './styles.module.scss';
import { unitTypeColorClasses } from '../unit-colors';
import { transposeChord } from '@/chopro/music';
import { SongUnitType } from '@/models/song-unit';
import { Mode } from '../ModeButtonSet';

type ChordProLineProps = {
  line: Line;
  isFirst: boolean;
  isLast: boolean;
  isLastOfColumn?: boolean;
  unitType?: SongUnitType;
  originalKey?: string;
  transpose?: number;
  grow?: boolean;
  mode: Mode;
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
  mode,
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
      {mode === 'text' && (
        <>
          {line.items.length === 0 && <br />}
          <div className="flex">
            {line.items.map((item, elementIdx) => (
              <ChordProItem
                item={item}
                hasLyrics={hasLyrics}
                hasChords={hasChords}
                originalKey={originalKey}
                transpose={transpose}
                key={`song-line-item-${elementIdx}`}
                mode={mode}
                hideChords={false}
                hideLyrics={true}
                isConnection={isConnection(line.items, elementIdx)}
              />
            ))}
          </div>
          <div className="flex">
            {line.items.map((item, elementIdx) => (
              <ChordProItem
                item={item}
                hasLyrics={hasLyrics}
                hasChords={hasChords}
                originalKey={originalKey}
                transpose={transpose}
                key={`song-line-item-${elementIdx}`}
                mode={mode}
                hideChords={true}
                hideLyrics={false}
                isConnection={isConnection(line.items, elementIdx)}
              />
            ))}
          </div>
        </>
      )}
      {mode !== 'text' && (
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
              mode={mode}
              isConnection={isConnection(line.items, elementIdx)}
            />
          ))}
        </div>
      )}
      {grow && <div className="flex-grow" />}
    </div>
  );
}

function ChordProItem({
  originalKey,
  hasLyrics,
  hasChords,
  hideChords,
  hideLyrics,
  item,
  isConnection,
  transpose,
  mode,
}: {
  originalKey?: string;
  hasLyrics: boolean;
  hasChords: boolean;
  hideChords?: boolean;
  hideLyrics?: boolean;
  item: any;
  isConnection: boolean;
  transpose?: number;
  mode: Mode;
}) {
  if (item._name === 'comment') {
    if (hideLyrics) {
      return null;
    }
    let className = 'italic';
    if (mode === 'text') {
      className = `${className} text-mono`;
    }
    return <span className={className}>{item._value}</span>;
  }

  let lyrics = item.lyrics || ' ';
  let chords = transpose && originalKey ? transposeChord(item.chords, originalKey, transpose) : item.chords;

  const chordClasses = ['mr-1', 'text-secondary', 'leading-none', 'font-bold', 'mb-0'];
  if (mode === 'text') {
    chordClasses.push('text-[1em]');
    chordClasses.push('font-mono');
    if (lyrics.length > chords.length) {
      chords = chords.padEnd(lyrics.length, ' ');
    }
  } else {
    chordClasses.push('text-[0.9em]');
  }
  if (hasChords) {
    chordClasses.push('h-[1em]');
  }

  const lyricsClasses = ['leading-none', 'text-[1em]', styles.lyrics];
  if (mode === 'text') {
    lyricsClasses.push('font-mono');
    if (chords.length > lyrics.length) {
      lyrics = lyrics.padEnd(chords.length, ' ');
    }
  }
  if (isConnection) {
    lyricsClasses.push(styles.lyricsConnection);
  }
  if (hasLyrics) {
    lyricsClasses.push('h-[1em]');
  }

  return (
    <div className={'flex flex-col whitespace-pre-wrap mb-2'}>
      {!hideChords && mode !== 'lyrics' && <span className={chordClasses.join(' ')}>{chords}</span>}
      {!hideLyrics && <span className={lyricsClasses.join(' ')}>{lyrics}</span>}
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
