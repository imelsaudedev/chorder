import type { Mode } from "@/components/config/config";
import { DEFAULT_COMMENT_CLASS } from "./chord-item-tokens";
import { prepareItemsForMode } from "./line-utils";
import StyledLine, { type StyledLineProps } from "./StyledLine";
import TextLine from "./TextLine";

type ChordProLineProps = Omit<StyledLineProps, "hasLyrics" | "hasChords">;

export default function ChordProLine({
  items: rawItems,
  originalKey,
  transpose,
  enharmonicPreference,
  mode,
  density,
  commentClass = DEFAULT_COMMENT_CLASS,
}: ChordProLineProps) {
  // Letra: sem convenções (nem o espaço delas). Convenções: sem acordes. Ver prepareItemsForMode.
  const items = prepareItemsForMode(rawItems, mode);
  if (!items) return null;

  // "Convenções" é a cifra sem acordes: usa o mesmo layout do modo "chords" (cada trecho de letra
  // numa coluna, com a convenção em chip acima), só que sem nenhum acorde pra desenhar.
  const renderMode: Mode = mode === "conventions" ? "chords" : mode;

  const hasLyrics = items.some(
    (item) => item._name !== "comment" && item.lyrics?.trim()
  );
  const hasChords = items.some(
    (item) => item._name !== "comment" && item.chords?.trim()
  );

  const hasPairedComment = items.some(
    (item, i) => item._name === "comment" && items[i + 1]?._name !== "comment" && items[i + 1] !== undefined
  );

  const px = renderMode === "text" ? "px-0 py-0" : "px-[var(--block-px)]";
  // 1.40625em: a altura do chip (1.125em) mais o vão até o acorde/letra (0.28125em) — ver chord-item-tokens.ts.
  const pt = hasPairedComment && renderMode !== "text" ? " pt-[1.40625em]" : "";
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
      {renderMode === "text" && <TextLine {...props} />}
      {renderMode !== "text" && <StyledLine mode={renderMode} {...props} />}
    </div>
  );
}
