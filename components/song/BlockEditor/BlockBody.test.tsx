import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, afterEach } from "vitest";
import ChordProViewer from "@/components/song/ChordProViewer";
import BlockBody from "./BlockBody";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Mesmos exemplos usados em chopro/block-model.test.ts, cobrindo os três
// detalhes finos da leitura (A2): comentário emparelhado, sílaba conectada
// e acorde com baixo invertido.
// A convenção só vira commentAbove quando está na MESMA linha do acorde
// seguinte (sem \n entre os dois) — chordsheetjs separa em Line por \n, e
// a lógica de pareamento olha só os items de uma linha (StyledLine.tsx:33-38).
const WITH_COMMENT = "{c:Pausa}[D]Oh, Sen[G]hor";
const WITH_CONNECTION = "[D]uma pala[G]vra-com[A]posta";
const WITH_SLASH_CHORD = "[D/F#]Minha [G/B]força";
const PLAIN = "[D]Primeira linha\n[G]Segunda linha";

function normalizedText(container: HTMLElement) {
  return container.textContent?.replace(/\s+/g, " ").trim();
}

describe("BlockBody — paridade visual com a leitura (ChordProViewer, D9: sem transpose)", () => {
  it.each([WITH_COMMENT, WITH_CONNECTION, WITH_SLASH_CHORD, PLAIN])(
    "mesmo texto renderizado que a leitura: %s",
    (content) => {
      const reading = render(<ChordProViewer chordpro={content} density="compact" />);
      const editing = render(<BlockBody content={content} />);
      expect(normalizedText(editing.container)).toBe(normalizedText(reading.container));
    }
  );

  it("mostra a convenção acima do acorde (critério 5) e aplica o padding condicional", () => {
    const { container } = render(<BlockBody content={WITH_COMMENT} />);
    expect(screen.getByText("Pausa")).toBeDefined();
    // mesma classe condicional de ChordProLine/index.tsx:27 quando há
    // comentário emparelhado na linha
    expect(container.querySelector(".pt-\\[1\\.375em\\]")).not.toBeNull();
  });

  it("não aplica o padding condicional quando não há comentário emparelhado", () => {
    const { container } = render(<BlockBody content={PLAIN} />);
    expect(container.querySelector(".pt-\\[1\\.375em\\]")).toBeNull();
  });

  it("conteúdo inválido mostra a mesma mensagem de erro do editor antigo", () => {
    render(<BlockBody content="{incompleto" />);
    expect(screen.getByText("Messages.invalidChordPro")).toBeDefined();
  });
});

describe("BlockBody — acorde e letra são alvos de toque separados (achado em teste manual)", () => {
  it("tocar no acorde chama onSelectItem com tap target \"chord\"", async () => {
    const user = userEvent.setup();
    const onSelectItem = vi.fn();
    render(<BlockBody content="[D]uma [G]duas" onSelectItem={onSelectItem} />);

    await user.click(screen.getByRole("button", { name: "D" }));

    expect(onSelectItem).toHaveBeenCalledWith(
      { lineIndex: 0, itemIndex: 0 },
      expect.any(HTMLElement),
      { target: "chord" }
    );
  });

  it("tocar na palavra chama onSelectItem com tap target \"lyrics\" e offset", async () => {
    const user = userEvent.setup();
    const onSelectItem = vi.fn();
    render(<BlockBody content="[D]uma [G]duas" onSelectItem={onSelectItem} />);

    await user.click(screen.getByText("uma"));
    // jsdom não implementa Range.getBoundingClientRect — a posição precisa
    // cai pra null, e quem recebe (BlockShell) decide o fallback (início
    // da palavra), mesmo comportamento de navegadores sem a API.
    expect(onSelectItem).toHaveBeenCalledWith(
      { lineIndex: 0, itemIndex: 0 },
      expect.any(HTMLElement),
      { target: "lyrics", offset: 0 }
    );
  });

  it("convenção isolada (não emparelhada) não é um alvo de toque", () => {
    const onSelectItem = vi.fn();
    render(<BlockBody content="{c:Só convenção}" onSelectItem={onSelectItem} />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("espaço entre palavras não é um alvo de toque (mesma convenção do protótipo de referência)", () => {
    render(<BlockBody content="[D]uma duas" onSelectItem={vi.fn()} />);
    // alvos de toque: o acorde "D" + as palavras "uma" e "duas" — o espaço
    // entre elas não vira nenhum botão à parte.
    expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual(["D", "uma", "duas"]);
  });
});

describe("BlockBody — posição exata do toque dentro da palavra (correção do bug 'letra errada')", () => {
  afterEach(() => {
    delete (Range.prototype as unknown as { getBoundingClientRect?: unknown }).getBoundingClientRect;
  });

  it("acha o caractere cuja caixa contém o ponto tocado, não o limite mais próximo", () => {
    const onSelectItem = vi.fn();
    render(<BlockBody content="palavra" onSelectItem={onSelectItem} />);

    // Simula: só o caractere de índice 3 ("a" em "pal[a]vra") tem uma caixa
    // real; todo o resto tem caixa vazia. O toque (clientX=105) cai dentro
    // da caixa do caractere 3 especificamente.
    Range.prototype.getBoundingClientRect = function (this: Range) {
      if (this.startOffset === 3) {
        return { left: 100, right: 110, top: 0, bottom: 20, width: 10, height: 20 } as DOMRect;
      }
      return { left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0 } as DOMRect;
    };

    const word = screen.getByText("palavra");
    fireEvent.click(word, { clientX: 105, clientY: 10 });

    expect(onSelectItem).toHaveBeenCalledWith(
      { lineIndex: 0, itemIndex: 0 },
      expect.any(HTMLElement),
      { target: "lyrics", offset: 3 }
    );
  });
});

describe("BlockBody — indicador visual: editar x inserir (achado em teste manual)", () => {
  it("marca o CHIP DO ACORDE em edição (já existente) com anel azul", () => {
    render(
      <BlockBody
        content="[D]uma [G]duas"
        selected={{ lineIndex: 0, itemIndex: 1, mode: "edit" }}
        onSelectItem={vi.fn()}
      />
    );
    expect(screen.getByRole("button", { name: "G" }).className).toMatch(/ring-sky-400/);
    expect(screen.getByRole("button", { name: "D" }).className).not.toMatch(/ring-sky-400/);
  });

  it("marca o CHIP DO ACORDE recém-inserido com anel verde, diferente do de edição", () => {
    render(
      <BlockBody
        content="[D]uma [G]duas"
        selected={{ lineIndex: 0, itemIndex: 1, mode: "insert" }}
        onSelectItem={vi.fn()}
      />
    );
    const chord = screen.getByRole("button", { name: "G" });
    expect(chord.className).toMatch(/ring-emerald-400/);
    expect(chord.className).not.toMatch(/ring-sky-400/);
  });

  it("o acorde sempre tem um fundo colorido visível, mesmo sem seleção (achado: indicativo de que é editável)", () => {
    render(<BlockBody content="[D]letra" chipClassName="bg-cyan-200 text-cyan-700" onSelectItem={vi.fn()} />);
    expect(screen.getByRole("button", { name: "D" }).className).toMatch(/bg-cyan-200/);
  });
});
