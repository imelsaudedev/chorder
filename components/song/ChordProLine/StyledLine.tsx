import { ChordProItem } from "@/chopro/music";
import Item, { ItemProps } from "./Item";
import { isConnection } from "./line-utils";

export type StyledLineProps = Omit<
  ItemProps,
  "hideChords" | "hideLyrics" | "item" | "isConnection"
> & {
  items: ChordProItem[];
};

export default function StyledLine({
  items,
  hasLyrics,
  hasChords,
  originalKey,
  transpose,
  mode,
  density,
}: StyledLineProps) {
  const containerClassName = mode === "chords" ? "flex flex-row flex-wrap" : "inline whitespace-pre-wrap";

  return (
    <div className={containerClassName}>
      {items.length === 0 && <br />}
      {items.map((item, elementIdx) => (
        <Item
          key={`song-line-item-${elementIdx}`}
          item={item}
          hasLyrics={hasLyrics}
          hasChords={hasChords}
          originalKey={originalKey}
          transpose={transpose}
          mode={mode}
          isConnection={isConnection(items, elementIdx)}
          density={density}
        />
      ))}
    </div>
  );
}
