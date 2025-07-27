import { ChordProItem, transposeChord } from "@/chopro/music";
import { Density, Mode } from "@/components/config/config";
import styles from "./styles.module.scss";

export type ItemProps = {
  originalKey?: string;
  transpose?: number;
  mode: Mode;
  density: Density;
  hasLyrics: boolean;
  hasChords: boolean;
  hideChords?: boolean;
  hideLyrics?: boolean;
  item: ChordProItem;
  isConnection: boolean;
};

export default function Item({
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
}: ItemProps) {
  if (item._name === "comment") {
    if (hideLyrics) {
      return null;
    }
    let className = "italic";
    if (mode === "text") {
      className = `${className} text-mono`;
    }
    return <span className={className}>{item._value}</span>;
  }

  let lyrics = item.lyrics || " ";
  let chords =
    transpose && originalKey
      ? transposeChord(item.chords, originalKey, transpose)
      : item.chords;

  const chordClasses = [
    "leading-none",
    "text-black",
    "font-mono",
    "font-bold",
    "mr-1",
    "mb-0",
  ];
  if (mode === "text") {
    chordClasses.push("text-[1em]", "font-mono");
    if (lyrics.length > chords.length) {
      chords = chords.padEnd(lyrics.length, " ");
    }
  } else {
    chordClasses.push(density === "compact" ? "" : "text-base");
  }
  if (hasChords) {
    chordClasses.push("h-[1em]");
  }

  const lyricsClasses = [
    mode === "chords" ? "flex" : "inline whitespace-pre-wrap",
    density === "compact" ? "leading-tight" : "leading-none",
    styles.lyrics,
  ];
  if (mode === "text") {
    lyricsClasses.push("font-mono", "leading-tight");
    if (chords.length > lyrics.length) {
      lyrics = lyrics.padEnd(chords.length, " ");
    }
  }
  if (isConnection) {
    lyricsClasses.push(styles.lyricsConnection);
  }
  if (hasLyrics) {
    lyricsClasses.push("h-[1em]");
  }

  const content = (
    <>
      {!hideChords && mode !== "lyrics" && (
        <span className={chordClasses.join(" ")}>{chords}</span>
      )}
      {!hideLyrics && <span className={lyricsClasses.join(" ")}>{lyrics}</span>}
    </>
  );

  if (mode === "chords") {
      return (
        <div
          className={`flex flex-col whitespace-pre-wrap ${
            density === "compact" ? "mb-1" : "mb-2"
          }`}
        >
          {content}
        </div>
      );
  }

  return content;
}
