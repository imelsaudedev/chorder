import { ChordProItem } from "@/chopro/music";
import { DEFAULT_COMMENT_CLASS } from "./chord-item-tokens";
import ConventionChip from "./ConventionChip";
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
  enharmonicPreference,
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

        // Convenção que sobra aqui não rotula nenhum trecho de letra (sozinha na linha ou no
        // fim dela): chip no mesmo estilo da emparelhada.
        if (item._name === "comment") {
          return (
            <ConventionChip
              key={`song-line-item-${elementIdx}`}
              value={item._value}
              hasLyrics={hasLyrics}
              commentClass={commentClass ?? DEFAULT_COMMENT_CLASS}
            />
          );
        }

        // (aqui `item` nunca é convenção: as soltas já saíram acima)
        const commentAbove = prev?._name === "comment" ? prev._value : undefined;

        return (
          <Item
            key={`song-line-item-${elementIdx}`}
            item={item}
            hasLyrics={hasLyrics}
            hasChords={hasChords}
            originalKey={originalKey}
            transpose={transpose}
            enharmonicPreference={enharmonicPreference}
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
