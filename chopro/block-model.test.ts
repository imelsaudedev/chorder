import { describe, expect, it } from "vitest";
import { parseChordPro, ChordProItem } from "./music";
import {
  canMoveChord,
  EditableItem,
  getPrecedingComment,
  insertChord,
  insertComment,
  insertCommentBefore,
  moveChordOneStep,
  parseBlock,
  removeMarker,
  serializeBlock,
  setMarkerValue,
  toEditableLines,
  toggleChordComment,
} from "./block-model";

// Conteúdo real, copiado de prisma/seed/songs.json — cobre CRLF, acordes com
// baixo invertido (slash), convenção com espaço após "c:" e variação "-"/"x"
// de repetição dentro do próprio texto (não é um token nosso, é letra).
const REAL_SAMPLES = [
  "Oh, Sen[D]hor tu me cing[F#]iste de ale[Bm]gria[Am]   [D]\r\nOh, Sen[G]hor tu me un[F#m7]giste de aleg[E4]ria [E]   [A]\r\nP[G]ois[F#] tu [Bm]és a aleg[G]ria da [D/F#]minha ale[G/B]gria\r\nMinha [D]força é a [E/G#]tua   [E] aleg[A4]ria[A]",
  "[E]Abra os olhos do meu coração\r\n[B4/D#]Abra os olhos do meu coração                          \r\nQuero te [C#m7]ver[A], quero te [E]ver",
  "{c:solo - convenção}\n[G7+] [A] [Bm] [D/F#] [- 4x]\n{c: suave}\n[G7+] [A] [Bm] [D/F#] [- 2x]",
  "[A9]Meu Jesus, [E]Salvador,\n[F#m]Outro [C#m]igual não[D7+] há\nTodos os [A/C#]dias [D]quero lou[A/E]var\nAs [F#m7]maravilhas [G]do [D/F#]teu a[E]mor [D/E]     [E]",
  "Quando [A]Deus achou-me\nEm [C#m]negras nuvens [D]de tribula[E]ção,\nFez na[A]scer um arco-[C#m]íris\nNo céu [D]do meu cora[E]ção",
  "[F#m] [D] [F#m] [D]",
  "",
  "{c:Pausa}",
  "linha sem nenhum acorde ou convenção, só letra",
];

describe("parseBlock/serializeBlock — identidade", () => {
  it.each(REAL_SAMPLES)("serializa de volta igual ao original: %s", (content) => {
    expect(serializeBlock(parseBlock(content))).toBe(content);
  });

  it("preserva diretiva desconhecida intocada (não é acorde nem convenção)", () => {
    const content = "{title: Minha música}\n[D]Letra";
    expect(serializeBlock(parseBlock(content))).toBe(content);
  });

  it("reconhece {comment:...} além de {c:...}", () => {
    const model = parseBlock("{comment:Forte}[D]letra");
    expect(model.tokens[0]).toMatchObject({ kind: "comment", value: "Forte" });
  });
});

describe("operações isoladas", () => {
  it("setMarkerValue troca só o acorde tocado", () => {
    const model = parseBlock("[D]letra[G]outra");
    const updated = setMarkerValue(model, 0, "A");
    expect(serializeBlock(updated)).toBe("[A]letra[G]outra");
  });

  it("setMarkerValue troca só a convenção tocada", () => {
    const model = parseBlock("{c:Pausa}[D]letra");
    const updated = setMarkerValue(model, 0, "Forte");
    expect(serializeBlock(updated)).toBe("{c:Forte}[D]letra");
  });

  it("removeMarker remove o acorde sem afetar a letra ao redor", () => {
    const model = parseBlock("ante[D]cedente");
    const updated = removeMarker(model, 1);
    expect(serializeBlock(updated)).toBe("antecedente");
  });

  it("removeMarker remove a convenção sem afetar o resto", () => {
    const model = parseBlock("{c:Pausa}[D]letra");
    const updated = removeMarker(model, 0);
    expect(serializeBlock(updated)).toBe("[D]letra");
  });

  it("insertChord insere no meio de uma palavra, dividindo o texto", () => {
    const model = parseBlock("palavra");
    const updated = insertChord(model, 0, 3, "Am");
    expect(serializeBlock(updated)).toBe("pal[Am]avra");
  });

  it("insertChord no início do texto não deixa token de texto vazio sobrando", () => {
    const model = parseBlock("palavra");
    const updated = insertChord(model, 0, 0, "Am");
    expect(serializeBlock(updated)).toBe("[Am]palavra");
    expect(updated.tokens[0]).toMatchObject({ kind: "chord", value: "Am" });
  });

  it("insertComment insere uma convenção no meio do texto", () => {
    const model = parseBlock("antes depois");
    const updated = insertComment(model, 0, 6, "Pausa");
    expect(serializeBlock(updated)).toBe("antes {c:Pausa}depois");
  });

  it("insertChord não afeta nenhum outro trecho do bloco (critério 4/6)", () => {
    const model = parseBlock("[D]uma linha\n[G]outra linha");
    const updated = insertChord(model, 3, 0, "Am");
    expect(serializeBlock(updated)).toBe("[D]uma linha\n[G][Am]outra linha");
  });
});

describe("moveChordOneStep — seção 8.3, mover uma letra ◀ ▶", () => {
  it("move para a direita, atravessando uma letra da palavra seguinte", () => {
    const model = parseBlock("[D]uma");
    const updated = moveChordOneStep(model, 0, "right");
    expect(serializeBlock(updated)).toBe("u[D]ma");
  });

  it("move para a esquerda, devolvendo a letra atravessada", () => {
    const model = parseBlock("u[D]ma");
    const updated = moveChordOneStep(model, 1, "left");
    expect(serializeBlock(updated)).toBe("[D]uma");
  });

  it("move repetidamente até o fim da palavra e depois não faz mais nada", () => {
    let model = parseBlock("[D]ab");
    model = moveChordOneStep(model, 0, "right");
    expect(serializeBlock(model)).toBe("a[D]b");
    const chordIndex = model.tokens.findIndex((t) => t.kind === "chord");
    model = moveChordOneStep(model, chordIndex, "right");
    expect(serializeBlock(model)).toBe("ab[D]");
    const chordIndex2 = model.tokens.findIndex((t) => t.kind === "chord");
    const unchanged = moveChordOneStep(model, chordIndex2, "right");
    expect(serializeBlock(unchanged)).toBe("ab[D]");
  });

  it("não atravessa quebra de linha", () => {
    const model = parseBlock("fim[D]\noutra linha");
    const updated = moveChordOneStep(model, 1, "right");
    expect(serializeBlock(updated)).toBe("fim[D]\noutra linha");
  });

  it("não move quando não há acorde nesse índice", () => {
    const model = parseBlock("{c:Pausa}letra");
    const updated = moveChordOneStep(model, 0, "right");
    expect(serializeBlock(updated)).toBe("{c:Pausa}letra");
  });
});

describe("canMoveChord — estado dos botões ◀ ▶", () => {
  it("true quando há letra do lado, false na borda da linha", () => {
    const model = parseBlock("[D]ab");
    expect(canMoveChord(model, 0, "right")).toBe(true);
    expect(canMoveChord(model, 0, "left")).toBe(false);
  });

  it("false quando o índice não é um acorde", () => {
    const model = parseBlock("{c:Pausa}letra");
    expect(canMoveChord(model, 0, "right")).toBe(false);
  });
});

describe("convenção do acorde (D8) — getPrecedingComment/toggleChordComment", () => {
  it("getPrecedingComment só reconhece convenção colada, sem texto entre os dois", () => {
    const model = parseBlock("{c:Pausa}[D]letra");
    expect(getPrecedingComment(model, 1)).toEqual({ tokenIndex: 0, value: "Pausa" });

    const comSeparacao = parseBlock("{c:Pausa} [D]letra");
    expect(getPrecedingComment(comSeparacao, 2)).toBeNull();
  });

  it("insertCommentBefore insere a convenção logo antes do acorde", () => {
    const model = parseBlock("[D]letra");
    const updated = insertCommentBefore(model, 0, "Pausa");
    expect(serializeBlock(updated)).toBe("{c:Pausa}[D]letra");
  });

  it("toggleChordComment aplica quando não há nenhuma", () => {
    const model = parseBlock("[D]letra");
    const updated = toggleChordComment(model, 0, "Pausa");
    expect(serializeBlock(updated)).toBe("{c:Pausa}[D]letra");
  });

  it("toggleChordComment remove ao tocar de novo na mesma convenção", () => {
    const model = parseBlock("{c:Pausa}[D]letra");
    const updated = toggleChordComment(model, 1, "Pausa");
    expect(serializeBlock(updated)).toBe("[D]letra");
  });

  it("toggleChordComment troca em vez de empilhar quando já há outra diferente", () => {
    const model = parseBlock("{c:Pausa}[D]letra");
    const updated = toggleChordComment(model, 1, "Forte");
    expect(serializeBlock(updated)).toBe("{c:Forte}[D]letra");
  });
});

describe("toEditableLines — mesmo agrupamento que chordsheetjs produz na leitura", () => {
  // Casos que fixam a regra (verificada empiricamente, chordsheetjs não a
  // documenta): um acorde rouba só a 1ª palavra do texto seguinte; o resto
  // do trecho até o próximo marcador é um item só, sem subdividir de novo;
  // texto que não vem logo depois de um acorde nunca é dividido.
  //
  // Nota: espaços múltiplos no FIM de uma linha (sem nenhum caractere depois)
  // disparam um bug conhecido do próprio `chordsheetjs` — a lyrics vira
  // " , , , , " (vírgulas alternadas) em vez dos espaços literais, a partir
  // de só 5 espaços seguidos (confirmado isoladamente). Isso é um bug de
  // terceiros na leitura, não algo que o block-model deva replicar — por
  // isso REAL_SAMPLES (que tem esse padrão, herdado de dados legados) não
  // entra aqui; a identidade do block-model com eles já é coberta acima,
  // sem depender do chordsheetjs.
  const CASES = [
    "[D]Oh, Sen[G]hor",
    "{c:Pausa}[D]Oh, Sen[G]hor",
    "[D]wordA wordB[G]wordC",
    "[D]wordA wordB wordC[G]wordD",
    "[D] [G] [A]",
    "[D]word  more[G]thing",
    "   leading text [D]x",
    "[D]word\tmore",
    "word   [D]x",
    "[D]\n[G]word",
    "[D][G]word",
    "[A9]Meu Jesus, [E]Salvador,\n[F#m]Outro [C#m]igual não[D7+] há\nTodos os [A/C#]dias [D]quero lou[A/E]var",
    "Quando [A]Deus achou-me\nEm [C#m]negras nuvens [D]de tribula[E]ção",
  ];

  function toComparable(items: (ChordProItem | EditableItem)[]) {
    return items.map((item) =>
      "_value" in item
        ? { kind: "comment", value: item._value }
        : item.kind === "comment"
          ? { kind: "comment", value: item.value }
          : { kind: "pair", chords: item.chords, lyrics: item.lyrics }
    );
  }

  it.each(CASES)("agrupamento idêntico ao de chordsheetjs: %s", (content) => {
    const expected = parseChordPro(content).lines.map((line) =>
      toComparable(line.items as ChordProItem[])
    );
    const actual = toEditableLines(parseBlock(content)).map((line) => toComparable(line));
    expect(actual).toEqual(expected);
  });

  it("carrega o índice exato do token de acorde existente", () => {
    const model = parseBlock("[D]uma [G]duas");
    const [line] = toEditableLines(model);
    expect(line[0]).toMatchObject({ chords: "D", lyrics: "uma ", chordTokenIndex: 0 });
    expect(line[1]).toMatchObject({ chords: "G", lyrics: "duas", chordTokenIndex: 2 });
  });

  it("carrega onde inserir um acorde novo quando a palavra ainda não tem um", () => {
    const model = parseBlock("[D]wordA wordB wordC");
    const [line] = toEditableLines(model);
    // line[1] é "wordB wordC" (achado: não se subdivide de novo)
    expect(line[1]).toMatchObject({ chords: "", chordTokenIndex: null });
    const insertAt = (line[1] as EditableItem & { kind: "pair" }).insertAt!;
    const updated = insertChord(model, insertAt.textTokenIndex, insertAt.offset, "Em");
    expect(serializeBlock(updated)).toBe("[D]wordA [Em]wordB wordC");
  });
});
