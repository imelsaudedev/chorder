import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
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

describe("BlockBody — seleção (placeholder até o modal da Etapa 4)", () => {
  it("toca num acorde/palavra chama onSelectItem com as coordenadas", async () => {
    const user = userEvent.setup();
    const onSelectItem = vi.fn();
    render(<BlockBody content="[D]uma [G]duas" onSelectItem={onSelectItem} />);

    await user.click(screen.getByText("uma"));
    expect(onSelectItem).toHaveBeenCalledWith({ lineIndex: 0, itemIndex: 0 });
  });

  it("convenção isolada (não emparelhada) não é um alvo de toque", () => {
    const onSelectItem = vi.fn();
    render(<BlockBody content="{c:Só convenção}" onSelectItem={onSelectItem} />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("marca o item selecionado com destaque", () => {
    const { container } = render(
      <BlockBody content="[D]uma [G]duas" selected={{ lineIndex: 0, itemIndex: 1 }} onSelectItem={vi.fn()} />
    );
    const buttons = container.querySelectorAll("button");
    expect(buttons[1].className).toMatch(/ring-sky-400/);
    expect(buttons[0].className).not.toMatch(/ring-sky-400/);
  });
});
