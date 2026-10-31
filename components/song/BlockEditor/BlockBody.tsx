"use client";

import {
  BlockModel,
  EditableItem,
  MoveDirection,
  canMoveChord,
  getPrecedingComment,
  insertChord,
  insertComment,
  moveChordOneStep,
  ordinalOfToken,
  parseBlock,
  removeMarker,
  serializeBlock,
  setMarkerValue,
  toEditableLines,
  toggleChordComment,
  tokenIndexForOrdinal,
} from "@/chopro/block-model";
import { ChordVariant, applyEnharmonicToGrid, buildChordGrid } from "@/chopro/chord-grid";
import { isValidChordName, parseChordPro } from "@/chopro/music";
import { COMMENT_CHIPS } from "@/components/song/ArrangementForm/SongUnitListForm/commentChips";
import { CHORD_TEXT_CLASS, COMMENT_LABEL_TEXT_CLASS } from "@/components/song/ChordProLine/chord-item-tokens";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { ChevronUp, PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";

// Corpo visual editável — rearquitetado (achado em teste manual: "os
// acordes continuam encavalando... um acorde maior empurra o outro pra
// direita, no edit não funciona"). A V1 desta reescrita (sessão anterior)
// media posição por OFFSET DE TEXTO num bloco de texto corrido só — isso
// nunca consegue "abrir espaço" numa palavra quando o acorde é mais largo
// que ela, porque não existe relação nenhuma entre a largura do chip e o
// layout do texto.
//
// Agora: um item (acorde+letra) por bloco de FLEX, igual a view real
// (ChordProLine/Item.tsx) e o corpo visual anterior a esta sessão — a
// largura de cada bloco já é o maior entre acorde e letra, por construção
// do navegador, então um acorde largo empurra o próximo item sozinho.
// O cursor nativo continua existindo: cada chip (acorde/convenção) é uma
// ILHA não-editável (contentEditable={false}) dentro do mesmo campo
// editável da linha; a LETRA continua sendo texto de verdade, clicável,
// com Selection/Range nativos — só que agora espalhada em vários nós de
// texto (um por item) em vez de um só, então a leitura do cursor anda a
// árvore inteira (TreeWalker) em vez de presumir um único nó.
//
// Digitar a LETRA continua bloqueado (beforeinput/paste/drop prevenidos) —
// o cursor serve só pra escolher onde inserir/editar acorde/convenção.
//
// Gaps conhecidos (não esquecimento, escopo menor pra validar a interação):
//   - grade do modal só mostra as 7 tríades do tom + grade expandida
//     (slash/dom. secundário/relativo) — sem o campo de digitar sempre
//     visível que o ChordModal antigo tinha (aqui é um "outro..." sob
//     demanda, funciona em mobile também).
//   - conexão visual de sílaba (acorde partindo uma palavra composta,
//     "pala-vra-com-posta", o "tracinho" de Item.tsx) não está replicada —
//     confirmado com o Tiago que não é necessário agora.

type BlockBodyProps = {
  content: string;
  onChangeContent: (content: string) => void;
  baseKey: string;
  enharmonicPreference?: "sharp" | "flat" | null;
  commentClass?: string;
  chipClassName?: string;
};

// Largura máxima do painel — igual ao ChordModal antigo (achado de teste
// manual daquela época: "a largura do bloco inteira é grande demais pra um
// popup de grade de acordes"). Achado de novo ao testar com várias
// colunas: a largura EXATA do bloco (sem teto) faz o painel esticar demais
// no desktop — tem teto, mas sem abrir mão de encolher no mobile.
const CHORD_MODAL_MAX_WIDTH = 320;

// Ajustes finos SÓ da edição (achado: "estas mudanças apenas no edit") — a
// leitura (Item.tsx) continua com os valores de chord-item-tokens.ts
// intactos; aqui sobrescrevemos só o que o corpo editável usa, sem tocar
// no arquivo compartilhado.
//
// O rótulo de convenção emparelhada era `position: absolute`, flutuando
// PRA FORA do item (igual a leitura) — mas um elemento absoluto nunca
// conta pro tamanho do item que o contém, então nenhuma margem (mr-1 ou
// qualquer outra) conseguia empurrar o item seguinte na medida certa
// quando o rótulo era mais largo que o acorde/letra por baixo (achado:
// "a margem direita na cifra não funcionou pra empurrar as letras à
// direita"). E por flutuar pra fora sem nenhum limite, também nada o
// impedia de invadir a palavra/acorde ANTERIOR quando o respiro natural
// não bastava (achado: "invadiu a palavra e cifra da esquerda").
//
// Fix: o rótulo deixou de ser absoluto — agora é mais uma linha normal
// dentro do próprio flex-col do item, empilhada ACIMA do acorde. Com isso
// a largura do item passa a ser o maior entre rótulo/acorde/letra de
// graça (mesmo mecanismo que já resolve "acorde largo empurra a
// palavra"), sem precisar medir nada manualmente — e o rótulo nunca
// escapa pra esquerda do próprio item, porque não está mais posicionado
// em relação a nada fora dele. A linha pontilhada que conectava rótulo e
// acorde virou redundante (ficam colados, empilhados) — removida só aqui.

function makeRect(left: number, top: number, width: number, height: number): DOMRect {
  return {
    left,
    top,
    right: left + width,
    bottom: top + height,
    width,
    height,
    x: left,
    y: top,
    toJSON() {
      return this;
    },
  } as DOMRect;
}

// Os chips (acorde/convenção) são contentEditable={false}, mas CONTÊM texto
// de verdade ("Dm7/F#", "Forte"...) — um TreeWalker com SHOW_TEXT andava por
// cima desse texto normalmente, porque contentEditable=false só afeta
// EDITABILIDADE, não a travessia da árvore. Isso inflava o offset GLOBAL
// sempre que havia um acorde/convenção ANTES do ponto clicado na mesma
// linha — a contagem lógica (buildLineIndex) NUNCA conta esse texto (só
// soma item.lyrics.length), então as duas divergiam (achado em teste
// manual: "às vezes o acorde é inserido um ou dois caracteres à direita...
// coloquei uma convenção, quis colocar um acorde na letra seguinte, a
// modal não aparece / aparece longe"). Filtro: rejeita qualquer nó de
// texto cujo ancestral mais próximo seja um elemento contentEditable=false
// — é exatamente a mesma marca que os chips já usam pra se anunciar como
// "ilha não-editável".
function isInsideNonEditableIsland(node: Node): boolean {
  const el = node.parentElement?.closest('[contenteditable="false"]');
  return !!el;
}

function createLineTextWalker(line: HTMLElement): TreeWalker {
  return document.createTreeWalker(line, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => (isInsideNonEditableIsland(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
}

// Offset GLOBAL de um Range qualquer dentro da linha inteira — soma o
// tamanho de todos os nós de texto EDITÁVEIS (ver createLineTextWalker)
// ANTES do nó onde o range começa. Compartilhado entre o cursor de verdade
// (Selection, abaixo) e o preview de hover (um Range calculado a partir da
// posição do mouse, não de uma seleção real).
function globalOffsetForRange(line: HTMLElement, range: Range): number | null {
  if (!line.contains(range.startContainer)) return null;
  if (isInsideNonEditableIsland(range.startContainer)) return null;
  const walker = createLineTextWalker(line);
  let cumulative = 0;
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (node === range.startContainer) return cumulative + range.startOffset;
    cumulative += node.textContent?.length ?? 0;
  }
  return null;
}

// Offset GLOBAL do cursor dentro da linha inteira — mesma ideia, lendo a
// Selection nativa de verdade (clique/toque reais).
function getGlobalCaretOffset(line: HTMLElement): number | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  return globalOffsetForRange(line, sel.getRangeAt(0));
}

// Mesma ideia, mas a partir de onde o MOUSE está (hover, sem clicar) — pro
// preview do cursor (achado: "é possível colocar o caret como hover? Passar
// o mouse e identificar que ali é possível clicar"). document.caretRangeFromPoint
// é WebKit/Blink; Firefox só tem caretPositionFromPoint (API diferente, sem
// Range pronto) — sem suporte ali, o preview simplesmente não aparece
// (degrada pra nada, não quebra nada).
function globalOffsetForPoint(line: HTMLElement, clientX: number, clientY: number): number | null {
  const doc = line.ownerDocument as Document & {
    caretRangeFromPoint?: (x: number, y: number) => Range | null;
  };
  if (typeof doc.caretRangeFromPoint !== "function") return null;
  const range = doc.caretRangeFromPoint(clientX, clientY);
  if (!range) return null;
  return globalOffsetForRange(line, range);
}

// Caminho inverso: onde, na árvore, cai um offset GLOBAL — acha o nó de
// texto certo (andando a mesma árvore) e devolve um Range ali (colapsado).
function rangeForGlobalOffset(line: HTMLElement, globalOffset: number): Range | null {
  const walker = createLineTextWalker(line);
  let cumulative = 0;
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const len = node.textContent?.length ?? 0;
    if (globalOffset <= cumulative + len) {
      const range = document.createRange();
      const local = Math.max(0, Math.min(globalOffset - cumulative, len));
      range.setStart(node, local);
      range.setEnd(node, local);
      return range;
    }
    cumulative += len;
  }
  return null;
}

// Onde, na TELA, cai um offset GLOBAL — só a medida (getBoundingClientRect).
function rectForGlobalOffset(line: HTMLElement, globalOffset: number): DOMRect | null {
  const range = rangeForGlobalOffset(line, globalOffset);
  if (!range) return null;
  // jsdom (ambiente de teste) não implementa Range.getBoundingClientRect —
  // mesma guarda defensiva que o corpo visual já tinha antes (achado real,
  // não hipotético: sem isso, montar BlockEditor quebra em qualquer teste,
  // mesmo sem testar edição nenhuma).
  if (typeof range.getBoundingClientRect !== "function") return null;
  return range.getBoundingClientRect();
}

// Recoloca a SELEÇÃO NATIVA de verdade num offset GLOBAL — não só a medida.
// Precisa disto além de rectForGlobalOffset porque depois de QUALQUER
// mutação do modelo (achado: "ao adicionar um acorde com cifra longa, o
// cursor não vai pra próxima letra que foi empurrada") o React troca os nós
// de texto (um item pode virar dois, por ex.), e a seleção antiga do
// navegador fica apontando pra um nó que não existe mais — sem recolocar,
// ela trava na posição de ANTES da mutação, e o próximo clique do usuário,
// confiando no traço azul (que também ficou parado lá), erra o alvo.
function setNativeCaretAtGlobalOffset(line: HTMLElement, globalOffset: number): void {
  const range = rangeForGlobalOffset(line, globalOffset);
  if (!range) return;
  const sel = window.getSelection();
  if (!sel) return;
  sel.removeAllRanges();
  sel.addRange(range);
}

// chipClassName/repeatBadge vem como "bg-X-200 text-X-700" (par pronto, do
// chip SEMPRE colorido do corpo visual anterior a esta sessão). O texto do
// chip precisa ser preto (igual a view real, Item.tsx: "text-foreground"
// no acorde) e só o FUNDO continua marcando o tipo do bloco — tira
// qualquer "text-*" antes de aplicar, em vez de confiar em ordem de
// classe (duas classes de mesma especificidade não se sobrescrevem só por
// ordem no atributo class).
function stripTextColor(classes: string): string {
  return classes
    .split(/\s+/)
    .filter((c) => c && !c.startsWith("text-"))
    .join(" ");
}

// ─── Camada de índice: onde cada item PAR (acorde+letra) começa no offset
// GLOBAL da linha, e o que significa o cursor cair num certo offset. ──────

type InsertResolution =
  | { action: "edit-chord"; tokenIndex: number; rangeIndex: number }
  | { action: "insert"; textTokenIndex: number; offset: number; rangeIndex: number };

type LineIndex = {
  ranges: { item: EditableItem & { kind: "pair" }; start: number }[];
  resolveInsertTarget: (globalOffset: number) => InsertResolution | null;
};

function buildLineIndex(items: EditableItem[]): LineIndex {
  let cursor = 0;
  const ranges: { item: EditableItem & { kind: "pair" }; start: number }[] = [];
  for (const item of items) {
    if (item.kind === "comment") continue;
    ranges.push({ item, start: cursor });
    cursor += item.lyrics.length;
  }

  function resolveInsertTarget(globalOffset: number): InsertResolution | null {
    for (let i = 0; i < ranges.length; i++) {
      const { item, start } = ranges[i];
      const end = start + item.lyrics.length;
      // Intervalo semiaberto [start, end) — a BORDA entre duas palavras
      // pertence à palavra SEGUINTE, não à anterior (exceto no fim da
      // linha). Achado em teste manual: sem isso, posicionar o cursor
      // "antes de uma letra que já tem acorde" resolvia pela palavra
      // anterior e nascia um acorde novo sobrepondo o que já existia ali.
      const isLast = i === ranges.length - 1;
      const inRange = isLast ? globalOffset >= start && globalOffset <= end : globalOffset >= start && globalOffset < end;
      if (!inRange) continue;
      const offsetWithinItem = globalOffset - start;
      // offset 0 só significa "editar o acorde existente" quando o
      // primeiro caractere é letra de verdade — senão (espaço) é um ponto
      // de inserção como outro qualquer (achado: "[D] [G]" tocar no espaço
      // do item D deve inserir ali, não editar).
      const firstCharIsLetter = item.lyrics.length > 0 && !/\s/.test(item.lyrics[0]);
      if (item.chordTokenIndex !== null && offsetWithinItem === 0 && firstCharIsLetter) {
        return { action: "edit-chord", tokenIndex: item.chordTokenIndex, rangeIndex: i };
      }
      if (item.insertAt) {
        return {
          action: "insert",
          textTokenIndex: item.insertAt.textTokenIndex,
          offset: item.insertAt.offset + offsetWithinItem,
          rangeIndex: i,
        };
      }
      return null;
    }
    return null;
  }

  return { ranges, resolveInsertTarget };
}

// Pareia cada convenção isolada com o PRÓXIMO item (se for par) — mesma
// regra de StyledLine.tsx/BlockBody.tsx anterior a esta sessão: convenção
// colada (sem nada entre os dois) vira rótulo ACIMA do acorde seguinte;
// sem próximo item par, fica isolada (seu próprio chip, em linha).
type RenderItem =
  | { kind: "pair"; item: EditableItem & { kind: "pair" }; commentAbove?: { value: string; tokenIndex: number } }
  | { kind: "comment"; item: EditableItem & { kind: "comment" } };

function buildRenderItems(items: EditableItem[]): RenderItem[] {
  const out: RenderItem[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.kind === "comment") {
      const next = items[i + 1];
      if (next && next.kind === "pair") continue;
      out.push({ kind: "comment", item });
      continue;
    }
    const prev = items[i - 1];
    const commentAbove = prev && prev.kind === "comment" ? { value: prev.value, tokenIndex: prev.tokenIndex } : undefined;
    out.push({ kind: "pair", item, commentAbove });
  }
  return out;
}

// ─── Painel único (acorde + convenção sempre juntos, qualquer que seja o
// alvo) — ver chopro/block-model.ts pros tipos reaproveitados. ────────────

type ToolbarTarget =
  | { kind: "chord"; ordinal: number }
  | { kind: "comment"; ordinal: number }
  | { kind: "empty"; textTokenIndex: number; offset: number };

type PositionContext = {
  chordTokenIndex: number | null;
  commentTokenIndex: number | null;
  insertAt: { textTokenIndex: number; offset: number } | null;
};

type CaretLineProps = {
  items: EditableItem[];
  model: BlockModel;
  onMutate: (next: BlockModel) => void;
  baseKey: string;
  enharmonicPreference?: "sharp" | "flat" | null;
  // Fundo do chip de acorde E convenção (texto sempre preto, igual a view
  // real — ver stripTextColor). A view real não usa nenhum fundo na
  // convenção; aqui adicionamos fundo só pra demarcar "isto é editável".
  chipClassName: string;
  // Critério de aceitação 8 da spec: "o modal tem a largura do bloco em
  // celular e desktop" — medida uma vez no BlockBody (pai de todas as
  // linhas) e repassada aqui.
  blockWidth: number | null;
};

function CaretLine({
  items,
  model,
  onMutate,
  baseKey,
  enharmonicPreference = null,
  chipClassName,
  blockWidth,
}: CaretLineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const chipElRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const itemColumnRefs = useRef<Record<number, HTMLSpanElement | null>>({});
  const [toolbar, setToolbar] = useState<ToolbarTarget | null>(null);
  const [caretDriven, setCaretDriven] = useState(false);
  const [caretRect, setCaretRect] = useState<{ left: number; top: number; height: number } | null>(null);
  // Preview do cursor ao passar o mouse (sem clicar) — achado: "é possível
  // colocar o caret como hover? identificar que ali é possível clicar".
  // Só em desktop por natureza (mousemove não existe em toque); não mexe
  // em seleção/toolbar nenhum, é 100% visual.
  const [hoverRect, setHoverRect] = useState<{ left: number; top: number; height: number } | null>(null);
  // Grade expandida (slash/dominante secundário/relativo) e os campos de
  // "outro acorde"/"outra convenção" — fechados por padrão, abertos sob
  // demanda. Resetam toda vez que o alvo do painel muda (ver toolbarKey).
  const [gridExpanded, setGridExpanded] = useState(false);
  const [customChordValue, setCustomChordValue] = useState("");
  const [customChordError, setCustomChordError] = useState(false);
  const [customCommentOpen, setCustomCommentOpen] = useState(false);
  const [customCommentValue, setCustomCommentValue] = useState("");

  const anchorRectRef = useRef<DOMRect>(makeRect(0, 0, 0, 0));
  const anchorRef = useRef<{ getBoundingClientRect(): DOMRect }>({
    getBoundingClientRect: () => anchorRectRef.current,
  });
  const lastGlobalOffsetRef = useRef<number | null>(null);

  // `items` é um array NOVO (referência) a cada mutação em QUALQUER linha
  // do bloco — toEditableLines(model) recria todas as linhas do zero
  // sempre, mesmo as que não mudaram nada (achado em teste manual: "o
  // cursor às vezes fica piscando em lugares aleatórios que eu já cliquei
  // antes" — o efeito abaixo, dependendo de `items` por REFERÊNCIA, rodava
  // de novo em TODA linha a cada edição, mesmo numa linha diferente de onde
  // o usuário estava, reacendendo o traço azul com o offset antigo que
  // ainda estava guardado ali). Assinatura por CONTEÚDO em vez de
  // referência: só muda de verdade quando ESTA linha mudou de verdade.
  const itemsSignature = useMemo(
    () => items.map((it) => (it.kind === "pair" ? `p:${it.chords}|${it.lyrics}` : `c:${it.value}`)).join("\u0000"),
    [items]
  );

  // Depois de uma mutação que realmente afetou ESTA linha (inserir/editar/
  // mover/remover acorde ou convenção), recoloca o cursor no MESMO lugar
  // lógico — veja setNativeCaretAtGlobalOffset pro porquê: sem isto, o
  // traço azul (e a seleção nativa por trás dele) ficava parado na posição
  // de ANTES da mutação (achado: "ao adicionar um acorde com cifra longa, o
  // cursor não vai pra próxima letra que foi empurrada; ao clicar, o
  // próximo acorde é inserido mais à direita" — o usuário confiava no
  // traço parado). O offset GLOBAL (contagem de caracteres de LETRA) não
  // muda com nenhuma dessas mutações — só markers de acorde/convenção são
  // inseridos, movidos ou removidos, nunca uma letra — então o mesmo
  // número de antes continua válido depois.
  useEffect(() => {
    if (!caretDriven) return;
    // Só quando o painel está FECHADO — achado em teste manual: "o botão
    // de mover ao ser clicado fecha a modal". setNativeCaretAtGlobalOffset
    // move a seleção nativa pra dentro da linha, o que rouba o FOCO de
    // volta pra ela — se o painel ainda está aberto (mover/editar não
    // fecham o toolbar, só inserir fecha), isso tira o foco de dentro do
    // Popover e o Radix entende como "clique fora", fechando sozinho. O
    // caso que este efeito existe pra consertar (inserir um acorde longo)
    // já fecha o toolbar ANTES de chegar aqui (setToolbar(null) roda no
    // mesmo handler que onMutate), então este guard não afeta aquele caso.
    if (toolbar) return;
    const offset = lastGlobalOffsetRef.current;
    if (offset === null) return;
    const line = lineRef.current;
    if (!line) return;
    setNativeCaretAtGlobalOffset(line, offset);
    const rect = rectForGlobalOffset(line, offset);
    if (rect) setCaretRect(toContainerCoords(rect));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsSignature]);

  const lineIndex = useMemo(() => buildLineIndex(items), [items]);
  const renderItems = useMemo(() => buildRenderItems(items), [items]);
  const hasLyrics = useMemo(
    () => items.some((item) => item.kind === "pair" && item.lyrics.trim().length > 0),
    [items]
  );
  const hasChords = useMemo(
    () => items.some((item) => item.kind === "pair" && item.chordTokenIndex !== null),
    [items]
  );
  const grid = useMemo(
    () => applyEnharmonicToGrid(buildChordGrid(baseKey), enharmonicPreference),
    [baseKey, enharmonicPreference]
  );

  const context: PositionContext | null = useMemo(() => {
    if (!toolbar) return null;
    if (toolbar.kind === "empty") {
      return { chordTokenIndex: null, commentTokenIndex: null, insertAt: { textTokenIndex: toolbar.textTokenIndex, offset: toolbar.offset } };
    }
    if (toolbar.kind === "chord") {
      const chordTokenIndex = tokenIndexForOrdinal(model, toolbar.ordinal, "chord");
      if (chordTokenIndex === null) return null;
      const commentTokenIndex = getPrecedingComment(model, chordTokenIndex)?.tokenIndex ?? null;
      return { chordTokenIndex, commentTokenIndex, insertAt: null };
    }
    const commentTokenIndex = tokenIndexForOrdinal(model, toolbar.ordinal, "comment");
    if (commentTokenIndex === null) return null;
    // Convenção emparelhada com o PRÓXIMO item par (ver buildRenderItems) —
    // acha esse item pra convergir no mesmo contexto de quem clicou no
    // acorde direto.
    const idxInItems = items.findIndex((it) => it.kind === "comment" && it.tokenIndex === commentTokenIndex);
    const next = idxInItems >= 0 ? items[idxInItems + 1] : undefined;
    const pairedChord = next && next.kind === "pair" ? next.chordTokenIndex : null;
    return { chordTokenIndex: pairedChord, commentTokenIndex, insertAt: null };
  }, [toolbar, model, items]);

  // Chave estável do ALVO (não do objeto `toolbar`, que troca de
  // referência a cada abertura mesmo mirando a mesma coisa) — reseta a
  // grade expandida e os campos de "outro..." só quando o usuário de fato
  // trocou de alvo, não a cada render.
  const toolbarKey = toolbar
    ? toolbar.kind === "empty"
      ? `empty-${toolbar.textTokenIndex}-${toolbar.offset}`
      : `${toolbar.kind}-${toolbar.ordinal}`
    : null;
  useEffect(() => {
    setGridExpanded(false);
    setCustomChordValue("");
    setCustomChordError(false);
    setCustomCommentOpen(false);
    setCustomCommentValue("");
  }, [toolbarKey]);

  function submitCustomChord() {
    const trimmed = customChordValue.trim();
    if (!trimmed) return;
    if (!isValidChordName(trimmed)) {
      setCustomChordError(true);
      return;
    }
    handlePickChord(trimmed);
    setCustomChordValue("");
    setCustomChordError(false);
  }

  function submitCustomComment() {
    const trimmed = customCommentValue.trim();
    if (!trimmed) return;
    handlePickComment(trimmed);
    setCustomCommentOpen(false);
    setCustomCommentValue("");
  }

  const currentChordValue =
    context?.chordTokenIndex !== null && context?.chordTokenIndex !== undefined
      ? lineIndex.ranges.find((r) => r.item.chordTokenIndex === context.chordTokenIndex)?.item.chords ?? null
      : null;
  const currentCommentValue =
    context?.commentTokenIndex !== null && context?.commentTokenIndex !== undefined
      ? (items.find((it) => it.kind === "comment" && it.tokenIndex === context.commentTokenIndex) as
          | (EditableItem & { kind: "comment" })
          | undefined
        )?.value ?? null
      : null;

  function handlePickChord(value: string) {
    if (!context) return;
    if (context.chordTokenIndex !== null) {
      onMutate(setMarkerValue(model, context.chordTokenIndex, value));
    } else if (context.insertAt) {
      onMutate(insertChord(model, context.insertAt.textTokenIndex, context.insertAt.offset, value));
      setToolbar(null);
    }
  }

  function handlePickComment(value: string) {
    if (!context) return;
    if (context.chordTokenIndex !== null) {
      onMutate(toggleChordComment(model, context.chordTokenIndex, value));
    } else if (context.commentTokenIndex !== null) {
      if (value === currentCommentValue) onMutate(removeMarker(model, context.commentTokenIndex));
      else onMutate(setMarkerValue(model, context.commentTokenIndex, value));
    } else if (context.insertAt) {
      onMutate(insertComment(model, context.insertAt.textTokenIndex, context.insertAt.offset, value));
      setToolbar(null);
    }
  }

  function handleRemoveChord() {
    if (!context || context.chordTokenIndex === null) return;
    onMutate(removeMarker(model, context.chordTokenIndex));
    setToolbar(null);
  }

  function handleRemoveComment() {
    if (!context || context.commentTokenIndex === null) return;
    onMutate(removeMarker(model, context.commentTokenIndex));
    setToolbar(null);
  }

  function handleMove(direction: MoveDirection) {
    if (!context || context.chordTokenIndex === null) return;
    onMutate(moveChordOneStep(model, context.chordTokenIndex, direction));
  }

  function handleMoveComment(direction: MoveDirection) {
    if (!context || context.commentTokenIndex === null) return;
    onMutate(moveChordOneStep(model, context.commentTokenIndex, direction, "comment"));
  }

  function toContainerCoords(rect: DOMRect) {
    const containerRect = containerRef.current!.getBoundingClientRect();
    return { left: rect.left - containerRect.left, top: rect.top - containerRect.top, height: rect.height };
  }

  function syncCaret() {
    const line = lineRef.current;
    if (!line) return;
    const offset = getGlobalCaretOffset(line);
    if (offset === null) return;
    // Guardado pro efeito de pós-mutação abaixo poder recolocar o cursor no
    // MESMO lugar lógico depois que os nós de texto trocarem.
    lastGlobalOffsetRef.current = offset;
    const glyphRect = rectForGlobalOffset(line, offset);
    if (glyphRect) setCaretRect(toContainerCoords(glyphRect));

    const resolution = lineIndex.resolveInsertTarget(offset);
    if (!resolution) {
      setToolbar(null);
      return;
    }
    setCaretDriven(true);
    // Âncora do painel = o próprio item (acorde+letra) tocado, medido de
    // verdade — não tem mais conta manual de "onde fica a fileira do
    // acorde": é onde o elemento REALMENTE está, porque agora é layout de
    // flex de verdade, igual a view.
    const itemEl = itemColumnRefs.current[resolution.rangeIndex];
    const fallback = glyphRect ?? makeRect(0, 0, 0, 0);
    anchorRectRef.current = itemEl?.getBoundingClientRect() ?? fallback;
    if (resolution.action === "edit-chord") {
      setToolbar({ kind: "chord", ordinal: ordinalOfToken(model, resolution.tokenIndex, "chord") });
    } else {
      setToolbar((prev) =>
        prev?.kind === "empty" && prev.textTokenIndex === resolution.textTokenIndex && prev.offset === resolution.offset
          ? prev
          : { kind: "empty", textTokenIndex: resolution.textTokenIndex, offset: resolution.offset }
      );
    }
  }

  // Preview do cursor no hover — não mexe em seleção/toolbar, só mede onde
  // o clique cairia e mostra um traço mais claro ali. Escondido quando já
  // existe um painel aberto (o traço de verdade, azul-cheio, já cobre esse
  // caso) pra não ter dois indicadores competindo.
  function handleLineMouseMove(e: React.MouseEvent) {
    if (toolbar) {
      if (hoverRect) setHoverRect(null);
      return;
    }
    const line = lineRef.current;
    if (!line) return;
    const offset = globalOffsetForPoint(line, e.clientX, e.clientY);
    if (offset === null) {
      setHoverRect(null);
      return;
    }
    const resolution = lineIndex.resolveInsertTarget(offset);
    if (!resolution) {
      setHoverRect(null);
      return;
    }
    const rect = rectForGlobalOffset(line, offset);
    setHoverRect(rect ? toContainerCoords(rect) : null);
  }

  function handleLineMouseLeave() {
    setHoverRect(null);
  }

  // Clicar num chip (ilha não-editável dentro do campo editável) ainda
  // deixa o navegador mover a seleção nativa pra perto dele — sem isto, o
  // mouseup/touchend desse mesmo toque "vaza" pro handler geral da linha
  // (syncCaret) logo depois, e os dois disputam qual painel abre.
  function stopBubble(e: React.SyntheticEvent) {
    e.stopPropagation();
  }

  function openChordChip(tokenIndex: number, e: React.MouseEvent) {
    e.stopPropagation();
    const chipEl = chipElRefs.current[`chord-${tokenIndex}`];
    if (chipEl) anchorRectRef.current = chipEl.getBoundingClientRect();
    setCaretDriven(false);
    setToolbar({ kind: "chord", ordinal: ordinalOfToken(model, tokenIndex, "chord") });
  }

  function openCommentChip(tokenIndex: number, e: React.MouseEvent) {
    e.stopPropagation();
    const chipEl = chipElRefs.current[`comment-${tokenIndex}`];
    if (chipEl) anchorRectRef.current = chipEl.getBoundingClientRect();
    setCaretDriven(false);
    setToolbar({ kind: "comment", ordinal: ordinalOfToken(model, tokenIndex, "comment") });
  }

  // Texto preto (igual a view real, Item.tsx: chord usa text-foreground, a
  // convenção não tem cor por tipo nenhuma) — só o FUNDO marca o tipo do
  // bloco, pra demarcar "isto é editável" sem fugir da cor de leitura do
  // texto.
  const chipBg = stripTextColor(chipClassName);
  // Área de toque invisível (pseudo-elemento, não altera o desenho visual
  // do chip) — assimétrica de propósito: com o espaçamento vertical bem
  // mais compacto agora, um -inset-2 (8px) uniforme nas 4 faces invadia a
  // fileira de cima (achado: "a área clicável está empurrando as linhas
  // acima e a convenção da cifra"). Reduz só a vertical; mantém mais
  // horizontal, onde o toque lateral ainda precisa de folga.
  const chipBase =
    "relative cursor-pointer select-none text-foreground hover:brightness-90 after:content-[''] after:absolute after:-top-1 after:-bottom-1 after:-left-2 after:-right-2";

  let rangeIndex = -1;

  return (
    <div ref={containerRef} className="relative inline-block max-w-full text-base mb-1.5">
      {/* Traço do cursor — único estilo (1px azul, piscando), sempre que o
          toolbar nasceu do cursor (não de clicar num chip direto). */}
      {caretRect && caretDriven && (
        <div
          aria-hidden
          className="absolute z-10 bg-sky-500 pointer-events-none animate-caret-blink"
          style={{ left: caretRect.left, top: caretRect.top, height: Math.max(caretRect.height, 16), width: 1 }}
        />
      )}
      {/* Preview do cursor no hover (mouse, sem clicar ainda) — mais claro
          e sem piscar, só pra avisar "dá pra clicar e inserir aqui". */}
      {hoverRect && (
        <div
          aria-hidden
          className="absolute z-10 bg-sky-500/40 pointer-events-none"
          style={{ left: hoverRect.left, top: hoverRect.top, height: Math.max(hoverRect.height, 16), width: 1 }}
        />
      )}

      <div
        ref={lineRef}
        onMouseMove={handleLineMouseMove}
        onMouseLeave={handleLineMouseLeave}
        contentEditable
        suppressContentEditableWarning
        // Teste manual (achado: o teclado abre no foco, não na digitação —
        // bloquear beforeinput não impede o teclado de aparecer). inputMode
        // "none" é o sinal padrão pra "editável, mas sem teclado virtual" —
        // suporte confiável em Chrome/Android; Safari/iOS tem histórico de
        // ser inconsistente em contentEditable (ainda não testado aqui).
        inputMode="none"
        onMouseUp={() => requestAnimationFrame(syncCaret)}
        onTouchEnd={() => requestAnimationFrame(syncCaret)}
        onKeyUp={() => requestAnimationFrame(syncCaret)}
        onBeforeInput={(e) => e.preventDefault()}
        onPaste={(e) => e.preventDefault()}
        onDrop={(e) => e.preventDefault()}
        style={{ caretColor: "transparent" }}
        className={[
          // Fonte IBM Plex Sans (mesma da view, Item.tsx — a letra nunca foi
          // mono lá, só o acorde é). Um item por bloco de flex, igual a
          // view: é isso que faz um acorde largo empurrar o próximo.
          // SEM gap genérico aqui — achado em teste manual: um gap fixo
          // entre TODOS os itens separa palavras que não deveriam separar
          // (ex. uma palavra partida por um acorde já ganha espaço de
          // graça da LARGURA do chip; um gap por cima disso é redundante).
          // O respiro só existe onde tem um motivo real — ver mr-1
          // condicional abaixo, item a item.
          "relative flex flex-row flex-wrap items-end outline-none font-sans text-foreground leading-tight",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {renderItems.map((ri, idx) => {
          if (ri.kind === "comment") {
            const isActive = toolbar?.kind === "comment" && context?.commentTokenIndex === ri.item.tokenIndex;
            return (
              <span key={`c-${ri.item.tokenIndex}`} className="inline-flex flex-col whitespace-pre-wrap mb-1.5">
                <button
                  type="button"
                  contentEditable={false}
                  onMouseUp={stopBubble}
                  onTouchEnd={stopBubble}
                  onClick={(e) => openCommentChip(ri.item.tokenIndex, e)}
                  ref={(el) => {
                    chipElRefs.current[`comment-${ri.item.tokenIndex}`] = el;
                  }}
                  className={[
                    chipBase,
                    COMMENT_LABEL_TEXT_CLASS,
                    "my-[0.25em] self-start rounded-sm p-1",
                    chipBg,
                    isActive ? "ring-2 ring-sky-400" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {ri.item.value}
                </button>
                {hasLyrics && (
                  <span className="invisible leading-none h-[1em]">&nbsp;</span>
                )}
              </span>
            );
          }

          rangeIndex += 1;
          const myRangeIndex = rangeIndex;
          const item = ri.item;
          // context carrega chordTokenIndex E commentTokenIndex JUNTOS
          // sempre que um dos dois abre o painel (um painel só, pros dois
          // juntos — ver o useMemo de `context` acima) — então sem checar
          // qual deles foi REALMENTE o alvo clicado (toolbar.kind), uma
          // convenção emparelhada e seu acorde ficavam com o anel "ativo"
          // os dois ao mesmo tempo (achado: "quando uma convenção sobrepõe
          // uma cifra, o selecionado fica nos dois").
          const isActiveChord =
            toolbar?.kind === "chord" && item.chordTokenIndex !== null && context?.chordTokenIndex === item.chordTokenIndex;
          const isActiveCommentAbove =
            toolbar?.kind === "comment" && !!ri.commentAbove && context?.commentTokenIndex === ri.commentAbove.tokenIndex;

          return (
            <span
              key={`p-${idx}`}
              ref={(el) => {
                itemColumnRefs.current[myRangeIndex] = el;
              }}
              className={[
                "relative inline-flex flex-col whitespace-pre-wrap mb-1.5",
                // Só ganha respiro à direita quando não há NENHUMA letra
                // própria (acordes colados, "[C][G]") — é o único caso em
                // que não existe espaço de verdade (nem palavra, nem
                // largura de chip) separando este item do próximo. O caso
                // da convenção emparelhada não precisa mais disso: o
                // rótulo agora está no fluxo (ver abaixo) e empurra o
                // próximo item sozinho, pela própria largura.
                // mr-2 (8px), não mr-1 (4px): medido num navegador real que
                // 4px aplicava certinho mas ficava imperceptível entre dois
                // chips do mesmo fundo (lê como "uma pastilha só", achado
                // em teste manual com 3 acordes colados). 8px é o mesmo
                // alcance da área de toque invisível (after:-left-2/-right-2
                // do chipBase) — não é um número novo, é um que já existe.
                item.lyrics.length === 0 ? "mr-2" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {ri.commentAbove && (
                <button
                  type="button"
                  contentEditable={false}
                  onMouseUp={stopBubble}
                  onTouchEnd={stopBubble}
                  onClick={(e) => openCommentChip(ri.commentAbove!.tokenIndex, e)}
                  ref={(el) => {
                    chipElRefs.current[`comment-${ri.commentAbove!.tokenIndex}`] = el;
                  }}
                  className={[
                    chipBase,
                    COMMENT_LABEL_TEXT_CLASS,
                    "self-start rounded-sm p-1",
                    chipBg,
                    isActiveCommentAbove ? "ring-2 ring-sky-400" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {ri.commentAbove.value}
                </button>
              )}
              {/* Linha pontilhada de volta (achado: "perdemos a linha
                  pontilhada" depois que o rótulo virou fluxo normal).
                  Absoluta de novo (não mais um irmão de altura fixa no
                  flex-col) — achado em teste manual: um espaçador de
                  altura fixa (h-1.5) não descia até a base da letra, só
                  preenchia o respiro entre rótulo e acorde. `top` começa
                  logo abaixo do rótulo (sua altura: fonte 0.75em + padding
                  p-1, ~1.25em) e `bottom-0` alcança a base de verdade do
                  item (acompanha acorde OU letra, o que for mais baixo). */}
              {ri.commentAbove && (
                <div aria-hidden className="absolute top-[1.25em] bottom-0 left-0 w-0 border-l border-dotted border-foreground/30" />
              )}

              {item.chordTokenIndex !== null ? (
                <button
                  type="button"
                  contentEditable={false}
                  onMouseUp={stopBubble}
                  onTouchEnd={stopBubble}
                  onClick={(e) => openChordChip(item.chordTokenIndex as number, e)}
                  ref={(el) => {
                    chipElRefs.current[`chord-${item.chordTokenIndex}`] = el;
                  }}
                  className={[
                    chipBase,
                    CHORD_TEXT_CLASS,
                    // text-sm (14px) só na edição — achado: "a fonte da
                    // cifra pro equivalente a 14px". Padding vertical pela
                    // metade (py-0.5, era p-1 nos 4 lados); h-5 acompanha o
                    // novo tamanho (box-sizing:border-box — manter h-6 com
                    // menos padding só sobraria espaço morto em vez de
                    // padding de verdade).
                    "text-sm self-start rounded-sm px-1 py-0.5 mb-0 h-5",
                    chipBg,
                    isActiveChord ? "ring-2 ring-sky-400" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {item.chords}
                </button>
              ) : (
                hasChords && <span className="h-5" aria-hidden />
              )}

              <span className={["flex", "leading-tight", hasLyrics ? "h-[1em]" : ""].filter(Boolean).join(" ")}>
                {item.lyrics}
              </span>
            </span>
          );
        })}
      </div>

      <Popover
        open={!!toolbar}
        onOpenChange={(next) => {
          if (!next) setToolbar(null);
        }}
      >
        <PopoverAnchor virtualRef={anchorRef as React.RefObject<{ getBoundingClientRect(): DOMRect }>} />
        {toolbar && (
          <PopoverContent
            side="top"
            align="start"
            sideOffset={6}
            collisionPadding={8}
            style={blockWidth ? { width: Math.min(blockWidth, CHORD_MODAL_MAX_WIDTH), maxWidth: "95vw" } : undefined}
            className="w-auto p-2 flex flex-col gap-1 text-xs"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onInteractOutside={(event) => {
              if (containerRef.current?.contains(event.target as Node)) event.preventDefault();
            }}
          >
            {context && (
              <>
                <div className="grid grid-cols-4 gap-1">
                  {grid.flatMap((row) => [row.triad, row.seventh]).map((value) => {
                    const disabled = context.chordTokenIndex === null && !context.insertAt;
                    return (
                      <button
                        key={value}
                        type="button"
                        disabled={disabled}
                        onClick={() => handlePickChord(value)}
                        className={[
                          "h-7 rounded text-center text-xs font-mono font-semibold border transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer",
                          value === currentChordValue
                            ? "bg-zinc-800 border-zinc-800 text-white"
                            : "bg-white border-zinc-200 shadow-xs hover:bg-zinc-50 text-zinc-800",
                        ].join(" ")}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>

                {(() => {
                  const chordSectionDisabled = context.chordTokenIndex === null && !context.insertAt;
                  return (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        {/* Ícone, não link de texto (achado: "o mais
                            acordes poderia ser um botão com um ícone"). */}
                        <button
                          type="button"
                          disabled={chordSectionDisabled}
                          onClick={() => setGridExpanded((v) => !v)}
                          aria-label={gridExpanded ? "Menos acordes" : "Mais acordes"}
                          title={gridExpanded ? "Menos acordes" : "Mais acordes"}
                          className="p-1 rounded text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        >
                          {gridExpanded ? <ChevronUp size={14} /> : <PlusIcon size={14} />}
                        </button>
                      </div>

                      {gridExpanded && (
                        // flex-wrap de só quem existe de verdade — a grade
                        // fixa 2 colunas antiga reservava uma célula vazia
                        // pra cada combinação slash/variante que o tom não
                        // tem (achado: "a grade não está fazendo sentido
                        // com elementos vazios"). max-h+scroll: cresce até
                        // um teto fixo em vez de empurrar a modal inteira
                        // pra cima sem limite (achado: "mais acordes muda o
                        // posicionamento da modal").
                        <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto">
                          {grid
                            .flatMap((row) => [
                              { chord: row.slash, variant: "slash" as ChordVariant | "slash" },
                              { chord: row.variante, variant: row.varType },
                            ])
                            .filter((cell): cell is { chord: string; variant: ChordVariant | "slash" } => !!cell.chord)
                            .map((cell, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => handlePickChord(cell.chord)}
                                className={[
                                  "h-7 min-w-10 px-1.5 rounded text-center text-xs font-mono font-semibold border transition-colors cursor-pointer",
                                  cell.chord === currentChordValue
                                    ? "bg-zinc-800 border-zinc-800 text-white"
                                    : cell.variant === "secdom"
                                      ? "bg-amber-50 border-amber-200 hover:bg-amber-100 text-amber-800"
                                      : cell.variant === "aem"
                                        ? "bg-white border-dashed border-violet-200 hover:bg-violet-50 text-violet-700"
                                        : "bg-white border-dashed border-zinc-300 hover:bg-zinc-50 text-zinc-700",
                                ].join(" ")}
                              >
                                {cell.chord}
                              </button>
                            ))}
                        </div>
                      )}

                      {/* Sempre aberto (não é mais um "outro..." escondido
                          atrás de um toggle) — achado: digitar um acorde
                          fora da grade é um caminho comum o bastante pra não
                          precisar de um clique extra só pra revelar o
                          campo. */}
                      <div className="flex flex-col gap-0.5">
                        <div className="flex gap-1">
                          <input
                            disabled={chordSectionDisabled}
                            value={customChordValue}
                            onChange={(e) => {
                              setCustomChordValue(e.target.value);
                              setCustomChordError(false);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                submitCustomChord();
                              }
                            }}
                            placeholder="Outro acorde (ex: Dsus4)"
                            className="flex-1 min-w-0 text-xs font-mono border border-zinc-200 rounded px-1.5 py-1 disabled:opacity-30"
                          />
                          <button
                            type="button"
                            disabled={chordSectionDisabled}
                            onClick={submitCustomChord}
                            className="text-xs px-2 py-1 rounded bg-zinc-800 text-white hover:bg-zinc-700 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                          >
                            OK
                          </button>
                        </div>
                        {customChordError && <span className="text-[10px] text-red-500">Acorde inválido</span>}
                      </div>
                    </div>
                  );
                })()}

                <div className="flex flex-wrap gap-1 border-t pt-1 max-w-48">
                  {COMMENT_CHIPS.map((c) => {
                    const disabled = context.chordTokenIndex === null && context.commentTokenIndex === null && !context.insertAt;
                    const active = c === currentCommentValue;
                    return (
                      <button
                        key={c}
                        type="button"
                        disabled={disabled}
                        onClick={() => handlePickComment(c)}
                        className={[
                          "text-[0.85em] rounded-sm px-1.5 py-0.5 border transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer",
                          active ? "bg-zinc-800 border-zinc-800 text-white" : "border-zinc-200 hover:bg-zinc-100",
                        ].join(" ")}
                      >
                        {c}
                      </button>
                    );
                  })}
                  {(() => {
                    const commentSectionDisabled =
                      context.chordTokenIndex === null && context.commentTokenIndex === null && !context.insertAt;
                    return (
                      <button
                        type="button"
                        disabled={commentSectionDisabled}
                        onClick={() => setCustomCommentOpen((v) => !v)}
                        className="text-[0.85em] text-zinc-500 hover:text-zinc-700 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                      >
                        outro...
                      </button>
                    );
                  })()}
                </div>
                {customCommentOpen && (
                  <div className="flex gap-1">
                    <input
                      autoFocus
                      value={customCommentValue}
                      onChange={(e) => setCustomCommentValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          submitCustomComment();
                        }
                      }}
                      placeholder="Ex: Só bateria"
                      className="flex-1 min-w-0 text-xs border border-zinc-200 rounded px-1.5 py-1"
                    />
                    <button
                      type="button"
                      onClick={submitCustomComment}
                      className="text-xs px-2 py-1 rounded bg-zinc-800 text-white hover:bg-zinc-700 cursor-pointer"
                    >
                      OK
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-1 border-t pt-1">
                  {/* Mover acorde OU convenção — nunca os dois ao mesmo
                      tempo: toolbar.kind diz qual dos dois é o alvo de
                      verdade do painel (achado: "a convenção também
                      poderia ser movida de uma letra para outra" — mesmo
                      mecanismo do acorde, só trocando qual token se move). */}
                  {toolbar.kind === "comment" ? (
                    <>
                      <button
                        type="button"
                        disabled={
                          context.commentTokenIndex === null ||
                          !canMoveChord(model, context.commentTokenIndex, "left", "comment")
                        }
                        onClick={() => handleMoveComment("left" as MoveDirection)}
                        className="px-2 py-1 rounded disabled:opacity-30 disabled:pointer-events-none hover:bg-zinc-100 cursor-pointer"
                      >
                        ◀
                      </button>
                      <button
                        type="button"
                        disabled={
                          context.commentTokenIndex === null ||
                          !canMoveChord(model, context.commentTokenIndex, "right", "comment")
                        }
                        onClick={() => handleMoveComment("right" as MoveDirection)}
                        className="px-2 py-1 rounded disabled:opacity-30 disabled:pointer-events-none hover:bg-zinc-100 cursor-pointer"
                      >
                        ▶
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        disabled={context.chordTokenIndex === null || !canMoveChord(model, context.chordTokenIndex, "left")}
                        onClick={() => handleMove("left" as MoveDirection)}
                        className="px-2 py-1 rounded disabled:opacity-30 disabled:pointer-events-none hover:bg-zinc-100 cursor-pointer"
                      >
                        ◀
                      </button>
                      <button
                        type="button"
                        disabled={context.chordTokenIndex === null || !canMoveChord(model, context.chordTokenIndex, "right")}
                        onClick={() => handleMove("right" as MoveDirection)}
                        className="px-2 py-1 rounded disabled:opacity-30 disabled:pointer-events-none hover:bg-zinc-100 cursor-pointer"
                      >
                        ▶
                      </button>
                    </>
                  )}
                  <div className="flex-1" />
                  {toolbar.kind === "comment" ? (
                    <button
                      type="button"
                      disabled={context.commentTokenIndex === null}
                      onClick={handleRemoveComment}
                      className="rounded-sm px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                    >
                      Remover
                    </button>
                  ) : toolbar.kind === "chord" ? (
                    <button
                      type="button"
                      disabled={context.chordTokenIndex === null}
                      onClick={handleRemoveChord}
                      className="rounded-sm px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                    >
                      Remover
                    </button>
                  ) : null}
                </div>
              </>
            )}
          </PopoverContent>
        )}
      </Popover>
    </div>
  );
}

export default function BlockBody({
  content,
  onChangeContent,
  baseKey,
  enharmonicPreference = null,
  commentClass = "text-zinc-600 border-zinc-600",
  chipClassName = "bg-zinc-100 text-zinc-700",
}: BlockBodyProps) {
  const t = useTranslations();
  const rootRef = useRef<HTMLDivElement>(null);
  const [blockWidth, setBlockWidth] = useState<number | null>(null);

  // Critério de aceitação 8: o painel do acorde/convenção tem a largura
  // exata do bloco (com teto, ver CHORD_MODAL_MAX_WIDTH). Medida uma vez
  // aqui (pai de todas as linhas) e repassada pra cada CaretLine.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setBlockWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const hasError = useMemo(() => {
    try {
      parseChordPro(content);
      return false;
    } catch {
      return true;
    }
  }, [content]);

  // Fonte única de verdade é `content` (prop) — sem estado próprio pro
  // model, igual o BlockShell antigo já fazia (parseBlock fresco a cada
  // mutação): evita qualquer risco de o estado interno divergir do
  // conteúdo salvo.
  const model = useMemo(() => parseBlock(content), [content]);
  const lines = useMemo(() => toEditableLines(model), [model]);

  function handleMutate(next: BlockModel) {
    onChangeContent(serializeBlock(next));
  }

  if (hasError) {
    return <p className="text-red-500 text-sm">{t("Messages.invalidChordPro")}</p>;
  }

  return (
    <div ref={rootRef} className="flex flex-col">
      {lines.map((items, lineIndex) => (
        <CaretLine
          key={lineIndex}
          items={items}
          model={model}
          onMutate={handleMutate}
          baseKey={baseKey}
          enharmonicPreference={enharmonicPreference}
          chipClassName={chipClassName}
          blockWidth={blockWidth}
        />
      ))}
    </div>
  );
}
