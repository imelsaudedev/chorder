import StyledLine, { type StyledLineProps } from "./StyledLine";
import TextLine from "./TextLine";

type ChordProLineProps = Omit<StyledLineProps, "hasLyrics" | "hasChords">;

export default function ChordProLine({
  items,
  originalKey,
  transpose,
  enharmonicPreference,
  mode,
  density,
  commentClass,
}: ChordProLineProps) {
  const hasLyrics = items.some(
    (item) => item._name !== "comment" && item.lyrics?.trim()
  );
  const hasChords = items.some(
    (item) => item._name !== "comment" && item.chords?.trim()
  );

  const hasPairedComment = items.some(
    (item, i) => item._name === "comment" && items[i + 1]?._name !== "comment" && items[i + 1] !== undefined
  );

  const px = mode === "text" ? "px-0 py-0" : "px-[var(--block-px)]";
  const pt = hasPairedComment && mode !== "text" ? " pt-[1.375em]" : "";
  const className = `flex flex-col relative ${px}${pt}`;

  const props = {
    items,
    originalKey,
    hasLyrics,
    hasChords,
    transpose,
    enharmonicPreference,
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
