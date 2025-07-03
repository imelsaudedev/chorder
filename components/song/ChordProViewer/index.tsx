import { ChordProItem, parseChordPro } from "@/chopro/music";
import ChordProLine from "@/components/song/ChordProLine";
import { Song } from "chordsheetjs";
import { useMemo } from "react";

export type ChordProViewerProps = {
  chordpro: string;
  density: "compact" | "normal";
};

export default function ChordProViewer({
  chordpro,
  density,
}: ChordProViewerProps) {
  const song = useMemo<Song>(() => parseChordPro(chordpro), [chordpro]);

  return (
    <>
      {song.lines.map((line, idx) => (
        <ChordProLine
          items={line.items as ChordProItem[]}
          mode="chords"
          key={`song-line-${idx}`}
          density={density}
        />
      ))}
    </>
  );
}
