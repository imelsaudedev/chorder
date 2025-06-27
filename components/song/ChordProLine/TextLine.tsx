import { ChordProItem } from "@/chopro/music";
import Item from "./Item";
import { isConnection } from "./line-utils";
import { StyledLineProps } from "./StyledLine";

type TextLineProps = Omit<StyledLineProps, "mode">;

export default function TextLine({ items, ...props }: TextLineProps) {
  return (
    <>
      {items.length === 0 && <br />}
      <div className="flex">
        {items.map((item, elementIdx) => (
          <Item
            key={`song-line-item-${elementIdx}`}
            item={item as ChordProItem}
            hideChords={false}
            hideLyrics={true}
            isConnection={isConnection(items, elementIdx)}
            mode="text"
            {...props}
          />
        ))}
      </div>
      <div className="flex">
        {items.map((item, elementIdx) => (
          <Item
            key={`song-line-item-${elementIdx}`}
            item={item as ChordProItem}
            hideChords={true}
            hideLyrics={false}
            isConnection={isConnection(items, elementIdx)}
            mode="text"
            {...props}
          />
        ))}
      </div>
    </>
  );
}
