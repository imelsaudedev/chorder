import { Song } from 'chordsheetjs';
import { parseChordPro } from '../../chopro/music';
import { Fragment, useMemo } from 'react';
import ChordProLine from '../ChordProLine';
import { SongUnitType } from '@/models/song-unit';

export type ChordProViewerProps = {
  chordpro: string;
  unitType?: SongUnitType;
  compact?: boolean; // Nova prop para estilos reduzidos
};

export default function ChordProViewer({ chordpro, unitType, compact }: ChordProViewerProps) {
  const chordproHtml = useMemo<Song>(() => parseChordPro(chordpro), [chordpro]);

  return (
    <>
      {chordproHtml.lines.map((line, idx) => (
        <ChordProLine line={line} mode="chords" key={`song-line-${idx}`} compact={compact} />
      ))}
    </>
  );
}
