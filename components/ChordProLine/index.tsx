import { Line } from 'chordsheetjs';
import styles from './styles.module.scss';
import { transposeChord } from '@/chopro/music';
import { Mode } from '../ModeButtonSet';

type ChordProLineProps = {
  line: Line;
  originalKey?: string;
  transpose?: number;
  mode: Mode;
  compact?: boolean;
};

export default function ChordProLine({ line, originalKey, transpose, mode, compact }: ChordProLineProps) {
  const hasLyrics = line.items.some((item) => (item as any).lyrics?.trim());
  const hasChords = line.items.some((item) => (item as any).chords?.trim());
  let className = compact ? 'px-2' : 'flex flex-col relative px-4';
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
                compact={compact}
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
                compact={compact}
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
              compact={compact}
            />
          ))}
        </div>
      )}
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
  compact,
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
  compact?: boolean;
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

  const chordClasses = ['leading-none', 'text-black', 'font-mono', 'font-bold', 'mr-1', 'mb-0'];
  if (mode === 'text') {
    chordClasses.push('text-[1em]', 'font-mono');
    if (lyrics.length > chords.length) {
      chords = chords.padEnd(lyrics.length, ' ');
    }
  } else {
    chordClasses.push(compact ? 'text-[0.9em]' : 'text-base');
  }
  if (hasChords) {
    chordClasses.push('h-[1em]');
  }

  const lyricsClasses = ['leading-none', compact ? 'text-sm' : 'text-base', styles.lyrics];
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
    <div className={compact ? 'flex flex-col whitespace-pre-wrap mb-1' : 'flex flex-col whitespace-pre-wrap mb-2'}>
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
