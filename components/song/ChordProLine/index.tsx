import StyledLine, { type StyledLineProps } from "./StyledLine";
import TextLine from "./TextLine";

type ChordProLineProps = Omit<StyledLineProps, "hasLyrics" | "hasChords">;

export default function ChordProLine({
  items,
  originalKey,
  transpose,
  mode,
  density,
}: ChordProLineProps) {
  const hasLyrics = items.some(
    (item) => item._name !== "comment" && item.lyrics.trim()
  );
  const hasChords = items.some(
    (item) => item._name !== "comment" && item.chords.trim()
  );

  let className = `flex flex-col relative ${
    mode === "text" ? "px-0 py-0" : density === "compact" ? "px-2" : "px-4"
  }`;

  const props = {
    items,
    originalKey,
    hasLyrics,
    hasChords,
    transpose,
    density,
  };

  return (
    <div className={className} style={{ breakInside: "avoid" }}>
      {mode === "text" && <TextLine {...props} />}
      {mode !== "text" && <StyledLine mode={mode} {...props} />}
    </div>
  );
}
