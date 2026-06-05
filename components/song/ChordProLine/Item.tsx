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
  commentAbove?: string;
  commentClass?: string;
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
  commentAbove,
  commentClass = "text-zinc-600 border-zinc-600",
}: ItemProps) {
  if (item._name === "comment") {
    if (hideLyrics) {
      return null;
    }
    if (mode === "text") {
      return <span className="italic font-mono">{item._value}</span>;
    }
    // standalone comment (not paired with a following item — handled by commentAbove)
    return (
      <div className={`flex flex-col whitespace-pre-wrap ${density === "compact" ? "mb-1" : "mb-2"}`}>
        <span className={`text-xs font-semibold leading-none my-2 self-start ${commentClass}`}>
          {item._value}
        </span>
        {hasLyrics && <span className="invisible leading-none h-[1em]">&nbsp;</span>}
      </div>
    );
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
        className={`relative flex flex-col whitespace-pre-wrap ${
          density === "compact" ? "mb-1" : "mb-2"
        }${commentAbove ? " pl-[9px]" : ""}`}
      >
        {commentAbove && (
          <>
            <div className={`absolute -top-[18px] left-1 bottom-0 w-0 border-l border-dotted ${commentClass}`} />
            <span className={`absolute -top-[22px] left-[9px] text-xs font-semibold whitespace-nowrap leading-5 ${commentClass}`}>
              {commentAbove}
            </span>
          </>
        )}
        {content}
      </div>
    );
  }

  return content;
}
