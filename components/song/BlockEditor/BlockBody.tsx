"use client";

import { ChordProItem, parseChordPro } from "@/chopro/music";
import { isConnection } from "@/components/song/ChordProLine/line-utils";
import styles from "@/components/song/ChordProLine/styles.module.scss";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

export type ItemCoords = { lineIndex: number; itemIndex: number };

type BlockBodyProps = {
  content: string;
  commentClass?: string;
  density?: "compact" | "normal";
  selected?: ItemCoords | null;
  onSelectItem?: (coords: ItemCoords) => void;
};

// Corpo visual tocável (Etapa 3 do PLANO.md) — componente novo (D3), sem
// tocar ChordProLine/StyledLine/Item. Réplica deliberada da MESMA
// renderização que ChordProViewer já usa pro preview do editor antigo: modo
// "chords" sempre, SEM transpose e SEM preferência enarmônica — o editor
// sempre mostra e edita o acorde literal salvo, no tom base (D9, corrige o
// bug A5). `isConnection` é importado de line-utils.ts (não duplicado) para
// não poder divergir da leitura (achado A2).
export default function BlockBody({
  content,
  commentClass,
  density = "compact",
  selected,
  onSelectItem,
}: BlockBodyProps) {
  const t = useTranslations();
  const { lines, hasError } = useMemo(() => {
    try {
      return { lines: parseChordPro(content).lines, hasError: false };
    } catch {
      return { lines: [], hasError: true };
    }
  }, [content]);

  if (hasError) {
    return <p className="text-red-500 text-sm">{t("Messages.invalidChordPro")}</p>;
  }

  return (
    <div
      className="flex flex-col"
      style={{ "--item-mb": "0.5em", "--block-px": "0" } as React.CSSProperties}
    >
      {lines.map((line, lineIndex) => (
        <BlockLine
          key={`block-line-${lineIndex}`}
          items={line.items as ChordProItem[]}
          lineIndex={lineIndex}
          commentClass={commentClass}
          density={density}
          selected={selected}
          onSelectItem={onSelectItem}
        />
      ))}
    </div>
  );
}

type BlockLineProps = {
  items: ChordProItem[];
  lineIndex: number;
  commentClass?: string;
  density: "compact" | "normal";
  selected?: ItemCoords | null;
  onSelectItem?: (coords: ItemCoords) => void;
};

function BlockLine({ items, lineIndex, commentClass, density, selected, onSelectItem }: BlockLineProps) {
  // Mesmos três cálculos de ChordProLine/index.tsx:15-24, replicados (não
  // importados, porque lá são locais ao componente) sobre os mesmos items.
  const hasLyrics = items.some((item) => item._name !== "comment" && item.lyrics?.trim());
  const hasChords = items.some((item) => item._name !== "comment" && item.chords?.trim());
  const hasPairedComment = items.some(
    (item, i) => item._name === "comment" && items[i + 1]?._name !== "comment" && items[i + 1] !== undefined
  );

  // Duas divs aninhadas, igual a ChordProLine (externa) + StyledLine
  // (interna) — mesmas classes, só mode "chords" (único usado no editor).
  const pt = hasPairedComment ? " pt-[1.375em]" : "";
  const outerClassName = `flex flex-col relative px-[var(--block-px)]${pt}`;

  return (
    <div className={outerClassName} style={{ breakInside: "avoid" }}>
      <div className="flex flex-row flex-wrap">
      {items.length === 0 && <br />}
      {items.map((item, itemIndex) => {
        const next = items[itemIndex + 1];
        const prev = itemIndex > 0 ? items[itemIndex - 1] : undefined;

        // Convenção emparelhada com o item seguinte: não renderiza aqui,
        // vira commentAbove do próximo (mesma lógica de StyledLine.tsx:33-38).
        if (item._name === "comment" && next && next._name !== "comment") {
          return null;
        }

        const commentAbove =
          prev?._name === "comment" && item._name !== "comment" ? prev._value : undefined;

        return (
          <BlockItem
            key={`block-item-${itemIndex}`}
            item={item}
            hasLyrics={hasLyrics}
            hasChords={hasChords}
            isConnection={isConnection(items, itemIndex)}
            commentAbove={commentAbove}
            commentClass={commentClass}
            density={density}
            isSelected={selected?.lineIndex === lineIndex && selected?.itemIndex === itemIndex}
            onSelect={
              onSelectItem && item._name !== "comment"
                ? () => onSelectItem({ lineIndex, itemIndex })
                : undefined
            }
          />
        );
      })}
      </div>
    </div>
  );
}

type BlockItemProps = {
  item: ChordProItem;
  hasLyrics: boolean;
  hasChords: boolean;
  isConnection: boolean;
  commentAbove?: string;
  commentClass?: string;
  density: "compact" | "normal";
  isSelected?: boolean;
  onSelect?: () => void;
};

// Réplica do ramo mode==="chords" de Item.tsx:100-125 — mesmas classes, só
// troca o <div> por <button> (alvo de toque) quando há onSelect.
function BlockItem({
  item,
  hasLyrics,
  hasChords,
  isConnection,
  commentAbove,
  commentClass = "text-zinc-600 border-zinc-600",
  density,
  isSelected,
  onSelect,
}: BlockItemProps) {
  if (item._name === "comment") {
    return (
      <div className="flex flex-col whitespace-pre-wrap mb-[var(--item-mb)]">
        <span className={`text-[0.75em] font-semibold leading-none my-[0.5em] self-start ${commentClass}`}>
          {item._value}
        </span>
        {hasLyrics && <span className="invisible leading-none h-[1em]">&nbsp;</span>}
      </div>
    );
  }

  const chords = item.chords || "";
  const lyrics = item.lyrics || " ";

  const chordClasses = [
    "leading-none",
    "text-foreground",
    "font-mono",
    "font-bold",
    "tracking-tighter",
    "pr-[0.5em]",
    "mb-0",
  ];
  if (hasChords) chordClasses.push("h-[1em]");

  const lyricsClasses = ["flex", density === "compact" ? "leading-tight" : "leading-none", styles.lyrics];
  if (isConnection) lyricsClasses.push(styles.lyricsConnection);
  if (hasLyrics) lyricsClasses.push("h-[1em]");

  const Wrapper = onSelect ? "button" : "div";

  return (
    <Wrapper
      type={onSelect ? "button" : undefined}
      onClick={onSelect}
      className={[
        "relative flex flex-col whitespace-pre-wrap mb-[var(--item-mb)] text-left appearance-none bg-transparent border-0 p-0 m-0",
        commentAbove ? "pl-[0.5625em]" : "",
        onSelect ? "cursor-pointer" : "",
        isSelected ? "ring-2 ring-offset-1 ring-sky-400 rounded" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {commentAbove && (
        <>
          <div className={`absolute -top-[1.125em] left-[0.25em] bottom-0 w-0 border-l border-dotted ${commentClass}`} />
          <span className={`absolute -top-[1.375em] left-[0.5625em] text-[0.75em] font-semibold whitespace-nowrap leading-none ${commentClass}`}>
            {commentAbove}
          </span>
        </>
      )}
      <span className={chordClasses.join(" ")}>{chords}</span>
      <span className={lyricsClasses.join(" ")}>{lyrics}</span>
    </Wrapper>
  );
}
