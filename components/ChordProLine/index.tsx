import { Line } from 'chordsheetjs';
import styles from './styles.module.scss';
import { transposeChord } from '@/chopro/music';
import { Mode } from '../ModeButtonSet';

type ChordProLineProps = {
  line: Line;
  originalKey?: string;
  transpose?: number;
  mode: Mode;
  density: 'compact' | 'normal';
};

export default function ChordProLine({ line, originalKey, transpose, mode, density }: ChordProLineProps) {
  const hasLyrics = line.items.some((item) => (item as any).lyrics?.trim());
  const hasChords = line.items.some((item) => (item as any).chords?.trim());

  let className = `flex flex-col relative ${mode === 'text' ? 'px-0 py-0' : density === 'compact' ? 'px-2' : 'px-4'}`;

  return (
    <div className={className} style={{ breakInside: 'avoid' }}>
      {mode === 'text' && (
        <>
          {line.items.length === 0 && <br />}
          <div className="flex">
            {line.items.map((item, elementIdx) => (
              <ChordProItem
                key={`song-line-item-${elementIdx}`}
                item={item}
                hasLyrics={hasLyrics}
                hasChords={hasChords}
                originalKey={originalKey}
                transpose={transpose}
                mode={mode}
                hideChords={false}
                hideLyrics={true}
                isConnection={isConnection(line.items, elementIdx)}
                density={density}
              />
            ))}
          </div>
          <div className="flex">
            {line.items.map((item, elementIdx) => (
              <ChordProItem
                key={`song-line-item-${elementIdx}`}
                item={item}
                hasLyrics={hasLyrics}
                hasChords={hasChords}
                originalKey={originalKey}
                transpose={transpose}
                mode={mode}
                hideChords={true}
                hideLyrics={false}
                isConnection={isConnection(line.items, elementIdx)}
                density={density}
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
              key={`song-line-item-${elementIdx}`}
              item={item}
              hasLyrics={hasLyrics}
              hasChords={hasChords}
              originalKey={originalKey}
              transpose={transpose}
              mode={mode}
              isConnection={isConnection(line.items, elementIdx)}
              density={density}
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
  density,
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
  density: 'compact' | 'normal';
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
    chordClasses.push(density === 'compact' ? '' : 'text-base');
  }
  if (hasChords) {
    chordClasses.push('h-[1em]');
  }

  const lyricsClasses = [density === 'compact' ? 'leading-tight' : 'leading-none', styles.lyrics];
  if (mode === 'text') {
    lyricsClasses.push('font-mono', 'leading-tight');
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
    <div className={`flex flex-col whitespace-pre-wrap ${density === 'compact' ? 'mb-1' : 'mb-2'}`}>
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
