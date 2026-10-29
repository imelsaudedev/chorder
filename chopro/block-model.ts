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

export type MoveDirection = "left" | "right";

/**
 * Move um acorde uma letra para a esquerda/direita, atravessando o texto
 * vizinho (seção 8.3: "mover uma letra ◀ ▶"). Não atravessa quebra de linha
 * — parar na borda da linha é o comportamento esperado, não um bug.
 */
export function moveChordOneStep(
  model: BlockModel,
  index: number,
  direction: MoveDirection
): BlockModel {
  const token = model.tokens[index];
  if (!token || token.kind !== "chord") return model;

  if (direction === "right") {
    const neighbor = model.tokens[index + 1];
    if (!neighbor || neighbor.kind !== "text" || neighbor.raw.length === 0) {
      return model;
    }
    const char = neighbor.raw[0];
    if (char === "\n" || char === "\r") return model;
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

  const neighbor = model.tokens[index - 1];
  if (!neighbor || neighbor.kind !== "text" || neighbor.raw.length === 0) {
    return model;
  }
  const char = neighbor.raw[neighbor.raw.length - 1];
  if (char === "\n" || char === "\r") return model;
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
