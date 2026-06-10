import { ChordProItem, applyEnharmonic, transposeChord } from "@/chopro/music";
import { Density, Mode } from "@/components/config/config";
import styles from "./styles.module.scss";

export type ItemProps = {
  originalKey?: string;
  transpose?: number;
  enharmonicPreference?: "sharp" | "flat" | null;
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
  enharmonicPreference,
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
      <div className="flex flex-col whitespace-pre-wrap mb-[var(--item-mb)]">
        <span className={`text-[0.75em] font-semibold leading-none my-[0.5em] self-start ${commentClass}`}>
          {item._value}
        </span>
        {hasLyrics && <span className="invisible leading-none h-[1em]">&nbsp;</span>}
      </div>
    );
  }

  let lyrics = item.lyrics || " ";
  let chords = item.chords || "";
  if (originalKey && item.chords) {
    chords = transposeChord(item.chords, originalKey, transpose ?? 0);
    if (enharmonicPreference) {
      chords = applyEnharmonic(chords, enharmonicPreference === "sharp");
    }
  }

  const chordClasses = [
    "leading-none",
    "text-foreground",
    "font-mono",
    "font-bold",
    "tracking-tighter",
    "pr-[0.5em]",
    "mb-0",
  ];
  if (mode === "text") {
    chordClasses.push("font-mono");
    if (lyrics.length > chords.length) {
      chords = chords.padEnd(lyrics.length, " ");
    }
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
        className={`relative flex flex-col whitespace-pre-wrap mb-[var(--item-mb)]${commentAbove ? " pl-[0.5625em]" : ""}`}
      >
        {commentAbove && (
          <>
            <div className={`absolute -top-[1.125em] left-[0.25em] bottom-0 w-0 border-l border-dotted ${commentClass}`} />
            <span className={`absolute -top-[1.375em] left-[0.5625em] text-[0.75em] font-semibold whitespace-nowrap leading-none ${commentClass}`}>
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
