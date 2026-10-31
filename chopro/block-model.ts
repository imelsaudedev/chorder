// Modelo de bloco tocável, com leitura/gravação sem perda (critério de
// aceitação 3 da spec de edição por blocos). `chordsheetjs` só lê ChordPro —
// não existe hoje nenhuma forma de escrever de volta preservando o que não
// foi editado. Em vez de reconstruir a string a partir de uma árvore
// (arriscado: qualquer detalhe não modelado se perderia), cada token guarda o
// trecho exato de origem (`raw`) que ele ocupa. Serializar é só concatenar
// esses trechos — então um bloco nunca tocado serializa byte a byte igual ao
// que entrou, por construção, sem precisar de nenhum teste de "parser
// completo". Só os três tokens que o editor by-toque entende (acorde,
// convenção `{c:}`/`{comment:}`, resto) são reconhecidos; qualquer outra
// diretiva (`{title:}`, etc.) cai em "text" e atravessa intocada.

export type ChordToken = { kind: "chord"; value: string; raw: string };
export type CommentToken = { kind: "comment"; value: string; raw: string };
export type TextToken = { kind: "text"; raw: string };
export type BlockToken = ChordToken | CommentToken | TextToken;

export type BlockModel = { tokens: BlockToken[] };

const TOKEN_RE = /\[([^\]]*)\]|\{\s*(?:c|comment)\s*:([^}]*)\}/gi;

export function parseBlock(content: string): BlockModel {
  const tokens: BlockToken[] = [];
  let lastIndex = 0;
  for (const match of content.matchAll(TOKEN_RE)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      tokens.push({ kind: "text", raw: content.slice(lastIndex, index) });
    }
    if (match[1] !== undefined) {
      tokens.push({ kind: "chord", value: match[1], raw: match[0] });
    } else {
      tokens.push({ kind: "comment", value: (match[2] ?? "").trim(), raw: match[0] });
    }
    lastIndex = index + match[0].length;
  }
  if (lastIndex < content.length) {
    tokens.push({ kind: "text", raw: content.slice(lastIndex) });
  }
  return { tokens };
}

export function serializeBlock(model: BlockModel): string {
  return model.tokens.map((token) => token.raw).join("");
}

function withTokens(model: BlockModel, tokens: BlockToken[]): BlockModel {
  return { tokens };
}

/** Troca o valor de um acorde ou convenção já existente. */
export function setMarkerValue(
  model: BlockModel,
  index: number,
  value: string
): BlockModel {
  const token = model.tokens[index];
  if (!token || token.kind === "text") return model;
  const raw = token.kind === "chord" ? `[${value}]` : `{c:${value}}`;
  const tokens = model.tokens.slice();
  tokens[index] = { ...token, value, raw } as BlockToken;
  return withTokens(model, tokens);
}

/** Remove um acorde ou convenção; a letra ao redor não é afetada. */
export function removeMarker(model: BlockModel, index: number): BlockModel {
  const token = model.tokens[index];
  if (!token || token.kind === "text") return model;
  const tokens = model.tokens.slice();
  tokens.splice(index, 1);
  return withTokens(model, tokens);
}

/**
 * Insere um acorde ou convenção dentro de um token de texto, na posição
 * `offset` (contada a partir do início do token). Divide o token de texto em
 * até duas partes ao redor do novo marcador.
 */
function insertMarker(
  model: BlockModel,
  textIndex: number,
  offset: number,
  marker: ChordToken | CommentToken
): BlockModel {
  const textToken = model.tokens[textIndex];
  if (!textToken || textToken.kind !== "text") return model;
  const before = textToken.raw.slice(0, offset);
  const after = textToken.raw.slice(offset);

  const replacement: BlockToken[] = [];
  if (before) replacement.push({ kind: "text", raw: before });
  replacement.push(marker);
  if (after) replacement.push({ kind: "text", raw: after });

  const tokens = model.tokens.slice();
  tokens.splice(textIndex, 1, ...replacement);
  return withTokens(model, tokens);
}

export function insertChord(
  model: BlockModel,
  textIndex: number,
  offset: number,
  value: string
): BlockModel {
  return insertMarker(model, textIndex, offset, {
    kind: "chord",
    value,
    raw: `[${value}]`,
  });
}

export function insertComment(
  model: BlockModel,
  textIndex: number,
  offset: number,
  value: string
): BlockModel {
  return insertMarker(model, textIndex, offset, {
    kind: "comment",
    value,
    raw: `{c:${value}}`,
  });
}

/**
 * Convenção "do acorde" (seção 8.3, D8): a convenção que o modal aplica a um
 * acorde é a que está imediatamente antes dele, sem nenhum texto entre os
 * dois — mesma condição de adjacência que StyledLine.tsx usa pra decidir
 * commentAbove, só que no nível de token (não de item já agrupado).
 */
export function getPrecedingComment(
  model: BlockModel,
  tokenIndex: number
): { tokenIndex: number; value: string } | null {
  const prev = model.tokens[tokenIndex - 1];
  if (!prev || prev.kind !== "comment") return null;
  return { tokenIndex: tokenIndex - 1, value: prev.value };
}

/** Insere uma convenção logo antes de um token (tipicamente um acorde). */
export function insertCommentBefore(
  model: BlockModel,
  tokenIndex: number,
  value: string
): BlockModel {
  const tokens = model.tokens.slice();
  tokens.splice(tokenIndex, 0, { kind: "comment", value, raw: `{c:${value}}` });
  return withTokens(model, tokens);
}

/**
 * Aplica/troca/remove a convenção de um acorde num só toque (D8: "tocar
 * aplica ao acorde; tocar de novo remove"). Tocar numa convenção diferente
 * da já aplicada troca em vez de empilhar — o app só reconhece uma convenção
 * emparelhada por acorde (StyledLine só olha um item pra trás).
 */
export function toggleChordComment(
  model: BlockModel,
  chordTokenIndex: number,
  value: string
): BlockModel {
  const preceding = getPrecedingComment(model, chordTokenIndex);
  if (preceding?.value === value) return removeMarker(model, preceding.tokenIndex);
  if (preceding) return setMarkerValue(model, preceding.tokenIndex, value);
  return insertCommentBefore(model, chordTokenIndex, value);
}

export type MoveDirection = "left" | "right";

/**
 * Se há uma letra pra atravessar naquela direção (botão ◀ ▶ habilitado) —
 * de acorde OU de convenção (achado: "a convenção também poderia ser
 * movida de uma letra para outra" — mesmo mecanismo, o token em `index`
 * nunca precisou ser especificamente um acorde, só não-texto). `kind`
 * default "chord" mantém as chamadas antigas (acorde) sem precisar mudar.
 */
export function canMoveChord(
  model: BlockModel,
  index: number,
  direction: MoveDirection,
  kind: "chord" | "comment" = "chord"
): boolean {
  const token = model.tokens[index];
  if (!token || token.kind !== kind) return false;
  const neighbor = model.tokens[direction === "right" ? index + 1 : index - 1];
  if (!neighbor || neighbor.kind !== "text" || neighbor.raw.length === 0) return false;
  const char = direction === "right" ? neighbor.raw[0] : neighbor.raw[neighbor.raw.length - 1];
  return char !== "\n" && char !== "\r";
}

/**
 * Move um acorde (ou convenção) uma letra para a esquerda/direita,
 * atravessando o texto vizinho (seção 8.3: "mover uma letra ◀ ▶"). Não
 * atravessa quebra de linha — parar na borda da linha é o comportamento
 * esperado, não um bug.
 */
export function moveChordOneStep(
  model: BlockModel,
  index: number,
  direction: MoveDirection,
  kind: "chord" | "comment" = "chord"
): BlockModel {
  if (!canMoveChord(model, index, direction, kind)) return model;

  if (direction === "right") {
    const neighbor = model.tokens[index + 1] as TextToken;
    const char = neighbor.raw[0];
    const rest = neighbor.raw.slice(1);

    const tokens = model.tokens.slice();
    const prev = tokens[index - 1];
    if (prev && prev.kind === "text") {
      tokens[index - 1] = { kind: "text", raw: prev.raw + char };
      if (rest) tokens[index + 1] = { kind: "text", raw: rest };
      else tokens.splice(index + 1, 1);
    } else {
      tokens.splice(index, 0, { kind: "text", raw: char });
      if (rest) tokens[index + 2] = { kind: "text", raw: rest };
      else tokens.splice(index + 2, 1);
    }
    return withTokens(model, tokens);
  }

  const neighbor = model.tokens[index - 1] as TextToken;
  const char = neighbor.raw[neighbor.raw.length - 1];
  const rest = neighbor.raw.slice(0, -1);

  const tokens = model.tokens.slice();
  const next = tokens[index + 1];
  if (next && next.kind === "text") {
    tokens[index + 1] = { kind: "text", raw: char + next.raw };
  } else {
    tokens.splice(index + 1, 0, { kind: "text", raw: char });
  }
  if (rest) tokens[index - 1] = { kind: "text", raw: rest };
  else tokens.splice(index - 1, 1);
  return withTokens(model, tokens);
}

// ─── Vista editável (Etapa 3/4) ────────────────────────────────────────────
//
// O corpo visual (BlockBody.tsx) precisa renderizar exatamente como
// `chordsheetjs` renderiza a leitura (paridade visual, Etapa 3) — mas editar
// via block-model.ts, por índice de token (Etapa 1), não via coordenada
// adivinhada. `toEditableLines` replica a regra de agrupamento do
// `chordsheetjs` (confirmada empiricamente, não documentada por ele) em cima
// dos tokens do próprio block-model, carregando o índice de token exato de
// cada item — union por construção, não por coincidência: cada acorde/
// convenção só pode vir de um [ ]/{c:} do próprio conteúdo, contado na mesma
// ordem em que aparece no texto, então as duas leituras nunca podem discordar
// sobre "qual é o 3º acorde da linha 2", mesmo sem comparar string a string.
//
// Regra (verificada com vários casos reais e sintéticos, inclusive acorde
// colado a acorde, várias palavras, espaços múltiplos, tab, linha só com
// espaço): um acorde "rouba" apenas a primeira palavra (não-espaço + todo o
// espaço em branco seguinte) do texto que vem depois dele; o que sobrar
// desse texto (se sobrar) vira um item seguinte só, sem acorde — não é
// dividido palavra a palavra de novo. Texto que não vem logo depois de um
// acorde (início de linha, ou depois de uma convenção) nunca é dividido.

export type EditableChordItem = {
  kind: "pair";
  chords: string;
  lyrics: string;
  // Índice em model.tokens do token [acorde] já existente — null quando esta
  // palavra ainda não tem acorde.
  chordTokenIndex: number | null;
  // Onde inserir um acorde novo (insertChord) quando chordTokenIndex é null.
  insertAt: { textTokenIndex: number; offset: number } | null;
};
export type EditableCommentItem = { kind: "comment"; value: string; tokenIndex: number };
export type EditableItem = EditableChordItem | EditableCommentItem;

type LineEntry =
  | { kind: "chord"; value: string; tokenIndex: number }
  | { kind: "comment"; value: string; tokenIndex: number }
  | { kind: "text"; text: string; tokenIndex: number; offset: number };

function splitIntoLineEntries(tokens: BlockToken[]): LineEntry[][] {
  const lines: LineEntry[][] = [[]];
  const currentLine = () => lines[lines.length - 1];

  tokens.forEach((token, tokenIndex) => {
    if (token.kind === "chord") {
      currentLine().push({ kind: "chord", value: token.value, tokenIndex });
      return;
    }
    if (token.kind === "comment") {
      currentLine().push({ kind: "comment", value: token.value, tokenIndex });
      return;
    }

    const breakRe = /\r\n|\n/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = breakRe.exec(token.raw))) {
      const piece = token.raw.slice(lastIndex, match.index);
      if (piece) currentLine().push({ kind: "text", text: piece, tokenIndex, offset: lastIndex });
      lastIndex = match.index + match[0].length;
      lines.push([]);
    }
    const rest = token.raw.slice(lastIndex);
    if (rest) currentLine().push({ kind: "text", text: rest, tokenIndex, offset: lastIndex });
  });

  return lines;
}

function lineEntriesToItems(entries: LineEntry[]): EditableItem[] {
  const items: EditableItem[] = [];
  let pendingChord: { value: string; tokenIndex: number } | null = null;

  const flushPendingAsEmpty = () => {
    if (pendingChord) {
      items.push({
        kind: "pair",
        chords: pendingChord.value,
        lyrics: "",
        chordTokenIndex: pendingChord.tokenIndex,
        insertAt: null,
      });
      pendingChord = null;
    }
  };

  for (const entry of entries) {
    if (entry.kind === "chord") {
      flushPendingAsEmpty();
      pendingChord = { value: entry.value, tokenIndex: entry.tokenIndex };
    } else if (entry.kind === "comment") {
      flushPendingAsEmpty();
      items.push({ kind: "comment", value: entry.value, tokenIndex: entry.tokenIndex });
    } else if (pendingChord) {
      const firstWord = /^\S*\s*/.exec(entry.text)![0];
      const rest = entry.text.slice(firstWord.length);
      items.push({
        kind: "pair",
        chords: pendingChord.value,
        lyrics: firstWord,
        chordTokenIndex: pendingChord.tokenIndex,
        // Mesmo com acorde já existente, insertAt aponta pra dentro da
        // própria lyrics desse item — tocar em qualquer posição que não
        // seja bem o início (offset 0) divide o texto e nasce um acorde
        // novo ali, no meio da palavra que já tinha um. offset 0 continua
        // significando "selecionar o acorde existente" (ver BlockShell).
        insertAt: { textTokenIndex: entry.tokenIndex, offset: entry.offset },
      });
      pendingChord = null;
      if (rest) {
        items.push({
          kind: "pair",
          chords: "",
          lyrics: rest,
          chordTokenIndex: null,
          insertAt: { textTokenIndex: entry.tokenIndex, offset: entry.offset + firstWord.length },
        });
      }
    } else {
      items.push({
        kind: "pair",
        chords: "",
        lyrics: entry.text,
        chordTokenIndex: null,
        insertAt: { textTokenIndex: entry.tokenIndex, offset: entry.offset },
      });
    }
  }
  flushPendingAsEmpty();
  return items;
}

export function toEditableLines(model: BlockModel): EditableItem[][] {
  return splitIntoLineEntries(model.tokens).map(lineEntriesToItems);
}

// ─── Rastreio estável entre edições ────────────────────────────────────────
//
// Um índice bruto de token (tokens[N]) desloca a cada inserção/remoção
// ANTES dele — inviável pra guardar "qual acorde está selecionado" entre um
// toque e o próximo, já que mover ◀▶ pode splicar/remover um token vizinho
// (ver moveChordOneStep) e aplicar uma convenção insere/remove um token de
// OUTRO tipo antes dele. O "ordinal" (sou o Nº-ésimo acorde/convenção da
// música inteira, contado na ordem em que aparecem) é estável a qualquer
// mudança que não mexa na CONTAGEM de tokens daquele mesmo tipo — ou seja,
// a tudo que importa pra edição de UM acorde/convenção por vez (mover,
// trocar valor, aplicar/remover uma convenção EM OUTRO acorde). Só precisa
// recalcular o ordinal quando a própria ação cria ou apaga um token desse
// tipo (inserir um novo, remover o que está selecionado).

export function ordinalOfToken(model: BlockModel, tokenIndex: number, kind: "chord" | "comment"): number {
  let ordinal = 0;
  for (let i = 0; i < tokenIndex; i++) {
    if (model.tokens[i].kind === kind) ordinal++;
  }
  return ordinal;
}

export function tokenIndexForOrdinal(
  model: BlockModel,
  ordinal: number,
  kind: "chord" | "comment"
): number | null {
  let count = 0;
  for (let i = 0; i < model.tokens.length; i++) {
    if (model.tokens[i].kind === kind) {
      if (count === ordinal) return i;
      count++;
    }
  }
  return null;
}
