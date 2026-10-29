"use client";

import { ChordProItem, parseChordPro } from "@/chopro/music";
import { isConnection } from "@/components/song/ChordProLine/line-utils";
import styles from "@/components/song/ChordProLine/styles.module.scss";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

export type ItemCoords = { lineIndex: number; itemIndex: number };
export type SelectedItem = ItemCoords & { mode: "edit" | "insert" };

// O que foi tocado: o próprio acorde (sempre "editar esse acorde", qualquer
// posição) ou um ponto na letra — aí a posição importa (offset, achado em
// teste manual: tocar numa letra específica do meio de uma palavra). offset
// null quando o navegador não oferece a API de medir texto (jsdom nos
// testes) — quem recebe decide o fallback.
export type TapInfo = { target: "chord" } | { target: "lyrics"; offset: number | null };

type BlockBodyProps = {
  content: string;
  commentClass?: string;
  // Fundo sempre visível do "chip" do acorde (cor do tipo do bloco) —
  // indicador de que ali é editável, igual ao protótipo de referência.
  chipClassName?: string;
  density?: "compact" | "normal";
  selected?: SelectedItem | null;
  onSelectItem?: (coords: ItemCoords, element: HTMLElement, tap: TapInfo) => void;
};

// Em qual caractere exato da palavra o toque caiu. Tentamos achar, dentre
// todos os nós de texto dentro do container, qual CARACTERE tem a caixa que
// contém o ponto tocado — não "o limite mais próximo" (document.caret*
// FromPoint arredonda pro lado mais perto, o que fazia o acorde nascer às
// vezes acima da PRÓXIMA letra em vez da letra tocada — achado em teste
// manual). Sem suporte (jsdom, ou navegador sem getBoundingClientRect em
// Range — também não implementado lá), cai pra null.
function resolveCharacterOffset(clientX: number, clientY: number, container: Node): number | null {
  const doc = container.ownerDocument;
  if (!doc?.createTreeWalker || typeof doc.createRange !== "function") return null;
  const range = doc.createRange();
  if (typeof range.getBoundingClientRect !== "function") return null;

  const walker = doc.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let cumulative = 0;
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const text = node.textContent ?? "";
    for (let i = 0; i < text.length; i++) {
      range.setStart(node, i);
      range.setEnd(node, i + 1);
      const rect = range.getBoundingClientRect();
      if (
        rect.width > 0 &&
        clientX >= rect.left &&
        clientX < rect.right &&
        clientY >= rect.top &&
        clientY < rect.bottom
      ) {
        return cumulative + i;
      }
    }
    cumulative += text.length;
  }
  // Toque não caiu em cima de nenhum caractere (ex.: no respiro depois da
  // última letra) — trata como "depois do fim", não como "nada".
  return cumulative;
}

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
  chipClassName,
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
          chipClassName={chipClassName}
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
  chipClassName?: string;
  density: "compact" | "normal";
  selected?: SelectedItem | null;
  onSelectItem?: (coords: ItemCoords, element: HTMLElement, tap: TapInfo) => void;
};

function BlockLine({ items, lineIndex, commentClass, chipClassName, density, selected, onSelectItem }: BlockLineProps) {
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
            chipClassName={chipClassName}
            density={density}
            selectedMode={
              selected?.lineIndex === lineIndex && selected?.itemIndex === itemIndex ? selected.mode : null
            }
            coords={{ lineIndex, itemIndex }}
            onSelect={
              onSelectItem && item._name !== "comment"
                ? (element, tap) => onSelectItem({ lineIndex, itemIndex }, element, tap)
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
  chipClassName?: string;
  density: "compact" | "normal";
  // null = não selecionado; "edit" = acorde já existente sendo editado
  // (anel azul); "insert" = acorde novo, acabou de nascer aqui (anel
  // verde) — indicador visual pros dois cenários apontados em teste manual.
  selectedMode?: "edit" | "insert" | null;
  coords?: ItemCoords;
  onSelect?: (element: HTMLElement, tap: TapInfo) => void;
};

// Divide a letra em palavras tocáveis + os espaços entre elas (intocados) —
// mesma convenção do protótipo de referência (função words(), que só marca
// \S+ como alvo). O espaço entre palavras fica sem alvo de toque, igual lá.
function splitIntoWords(text: string) {
  const parts: { text: string; offset: number; interactive: boolean }[] = [];
  const re = /\S+/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push({ text: text.slice(last, m.index), offset: last, interactive: false });
    parts.push({ text: m[0], offset: m.index, interactive: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), offset: last, interactive: false });
  if (parts.length === 0) parts.push({ text, offset: 0, interactive: false });
  return parts;
}

// Corpo visual: acorde é um chip com fundo sempre visível (cor do tipo do
// bloco, como no protótipo de referência — não só reage a seleção, indica
// "isto é editável" o tempo todo) e a letra é dividida em palavras com
// sublinhado pontilhado + hover, cada uma seu próprio alvo de toque. Tocar
// no PRÓPRIO acorde sempre seleciona ele pra editar; tocar na letra em
// qualquer posição que não seja o começo do acorde atual insere um acorde
// novo bem ali (mesmo dentro de uma palavra que já tem acorde — ver
// BlockShell e block-model.ts toEditableLines).
function BlockItem({
  item,
  hasLyrics,
  hasChords,
  isConnection,
  commentAbove,
  commentClass = "text-zinc-600 border-zinc-600",
  chipClassName = "bg-zinc-100 text-zinc-700",
  density,
  selectedMode,
  coords,
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
  const words = splitIntoWords(lyrics);
  const blockItemAttr = coords ? `${coords.lineIndex}-${coords.itemIndex}` : undefined;

  const lyricsRowClasses = [
    "flex",
    density === "compact" ? "leading-tight" : "leading-none",
    styles.lyrics,
  ];
  if (isConnection) lyricsRowClasses.push(styles.lyricsConnection);
  if (hasLyrics) lyricsRowClasses.push("h-[1em]");

  const chordRingClass =
    selectedMode === "edit" ? "ring-2 ring-sky-400" : selectedMode === "insert" ? "ring-2 ring-emerald-400" : "";

  return (
    <span
      data-block-item={blockItemAttr}
      className={`relative inline-flex flex-col whitespace-pre-wrap mb-[var(--item-mb)]${
        commentAbove ? " pl-[0.5625em]" : ""
      }`}
    >
      {commentAbove && (
        <>
          <div className={`absolute -top-[1.125em] left-[0.25em] bottom-0 w-0 border-l border-dotted ${commentClass}`} />
          <span className={`absolute -top-[1.375em] left-[0.5625em] text-[0.75em] font-semibold whitespace-nowrap leading-none ${commentClass}`}>
            {commentAbove}
          </span>
        </>
      )}

      {chords ? (
        <button
          type="button"
          onClick={(e) => onSelect?.(e.currentTarget, { target: "chord" })}
          className={[
            "relative self-start leading-none font-mono font-bold tracking-tighter rounded-sm px-[0.3em] mb-0 h-[1em] text-left appearance-none border-0 m-0",
            // Área de toque maior que o texto visível, sem mudar o layout
            // (mesma técnica do protótipo de referência) — achado em teste
            // manual: alvo pequeno demais no celular.
            onSelect ? "cursor-pointer after:content-[''] after:absolute after:-inset-2" : "",
            chipClassName,
            chordRingClass,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {chords}
        </button>
      ) : (
        hasChords && <span className="h-[1em]" aria-hidden />
      )}

      <span className={lyricsRowClasses.filter(Boolean).join(" ")}>
        {words.map((w, i) =>
          w.interactive ? (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                if (!onSelect) return;
                const el = e.currentTarget;
                const charOffset = resolveCharacterOffset(e.clientX, e.clientY, el);
                onSelect(el, { target: "lyrics", offset: w.offset + (charOffset ?? 0) });
              }}
              className={[
                "relative text-left appearance-none bg-transparent border-0 p-0 m-0 font-inherit",
                onSelect
                  ? // Alvo de toque mais alto que a linha de texto (achado em
                    // teste manual) — só na vertical, pra não sobrepor a
                    // palavra vizinha horizontalmente.
                    "cursor-pointer underline decoration-dotted decoration-current/30 underline-offset-2 hover:bg-zinc-100 rounded-sm after:content-[''] after:absolute after:-top-2 after:-bottom-2 after:left-0 after:right-0"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {w.text}
            </button>
          ) : (
            <span key={i}>{w.text}</span>
          )
        )}
      </span>
    </span>
  );
}
