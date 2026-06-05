import StyledLine, { type StyledLineProps } from "./StyledLine";
import TextLine from "./TextLine";

type ChordProLineProps = Omit<StyledLineProps, "hasLyrics" | "hasChords">;

export default function ChordProLine({
  items,
  originalKey,
  transpose,
  mode,
  density,
  commentClass,
}: ChordProLineProps) {
  const hasLyrics = items.some(
    (item) => item._name !== "comment" && item.lyrics.trim()
  );
  const hasChords = items.some(
    (item) => item._name !== "comment" && item.chords.trim()
  );

  const hasPairedComment = items.some(
    (item, i) => item._name === "comment" && items[i + 1]?._name !== "comment" && items[i + 1] !== undefined
  );

  let className = `flex flex-col relative ${
    mode === "text" ? "px-0 py-0" : density === "compact" ? "px-2" : "px-4"
  }${hasPairedComment && mode !== "text" ? " pt-[22px]" : ""}`;

  const props = {
    items,
    originalKey,
    hasLyrics,
    hasChords,
    transpose,
    density,
    commentClass,
  };

  return (
    <div className={className} style={{ breakInside: "avoid" }}>
      {mode === "text" && <TextLine {...props} />}
      {mode !== "text" && <StyledLine mode={mode} {...props} />}
    </div>
  );
}
