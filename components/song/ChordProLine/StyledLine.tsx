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
  commentClass,
}: StyledLineProps) {
  const containerClassName = mode === "chords" ? "flex flex-row flex-wrap" : "inline whitespace-pre-wrap";

  return (
    <div className={containerClassName}>
      {items.length === 0 && <br />}
      {items.map((item, elementIdx) => {
        const next = items[elementIdx + 1];
        const prev = elementIdx > 0 ? items[elementIdx - 1] : undefined;

        // comment paired with the next item: skip here, rendered via commentAbove
        if (item._name === "comment" && next && next._name !== "comment") {
          return null;
        }

        const commentAbove =
          prev?._name === "comment" && item._name !== "comment" ? prev._value : undefined;

        return (
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
            commentAbove={commentAbove}
            commentClass={commentClass}
          />
        );
      })}
    </div>
  );
}
