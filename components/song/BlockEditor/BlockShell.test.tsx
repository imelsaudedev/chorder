import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ClientSongUnit, SongUnitType } from "@/prisma/models";
import BlockShell from "./BlockShell";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

const noop = () => {};

// BlockShell é controlado: sem o pai realimentando `unit.content` depois de
// onChangeContent, o modal nunca veria o acorde recém-inserido/alterado (a
// mesma coisa que aconteceria de verdade se o BlockEditor não atualizasse o
// array). Este harness simula esse "pai" mínimo, enquanto ainda expõe um
// spy (`onChange`) pras asserções.
function Harness({
  initialContent,
  type = "VERSE",
  baseKey = "D",
  onChange,
}: {
  initialContent: string;
  type?: SongUnitType;
  baseKey?: string;
  onChange: (content: string) => void;
}) {
  const [content, setContent] = useState(initialContent);
  const unit: ClientSongUnit = { type, content, order: 1, notes: null, repeatCount: 1 };
  return (
    <BlockShell
      unit={unit}
      number={1}
      isFirst={false}
      isLast={false}
      canDelete
      baseKey={baseKey}
      onChangeType={noop}
      onMoveUp={noop}
      onMoveDown={noop}
      onDuplicate={noop}
      onInsertBefore={noop}
      onInsertAfter={noop}
      onRemove={noop}
      onChangeNotes={noop}
      onChangeContent={(next) => {
        onChange(next);
        setContent(next);
      }}
    />
  );
}

// O corpo tem seu próprio chip de acorde (fundo sempre visível) e a grade
// do modal também mostra os acordes do tom — os dois podem ter o mesmo
// nome ("D", "G"...). Os testes que checam a grade escopam a busca aqui.
function modal() {
  return within(screen.getByTestId("chord-modal"));
}

// O corpo pode ter um acorde com o mesmo nome de uma célula da grade do
// modal (ex.: baseKey "D" e o acorde recém-inserido também "D") — pega
// especificamente o chip do CORPO, fora do modal.
function bodyChordButton(name: string) {
  const match = screen
    .getAllByRole("button", { name })
    .find((el) => !el.closest('[data-testid="chord-modal"]'));
  if (!match) throw new Error(`Nenhum botão "${name}" fora do modal`);
  return match;
}

describe("BlockShell — ponte entre toque, block-model e o modal (Etapa 4)", () => {
  it("8.4: tocar numa palavra sem acorde insere o acorde do tom (I) e abre o modal", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness initialContent="palavra" onChange={onChange} />);

    await user.click(screen.getByText("palavra"));

    expect(onChange).toHaveBeenCalledWith("[D]palavra");
    expect(modal().getByRole("button", { name: "D" })).toHaveClass("bg-zinc-800");
    // indicador visual do cenário "inserir" (achado em teste manual: os
    // dois cenários — editar x inserir — pareciam idênticos) — o chip do
    // acorde no CORPO (não o da grade) ganha o anel verde.
    expect(screen.getByText("Acorde novo")).toBeDefined();
    expect(bodyChordButton("D").className).toMatch(/ring-emerald-400/);
  });

  it("8.4: tocar numa palavra que já tem acorde só seleciona, sem mudar o conteúdo", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness initialContent="[G]palavra" onChange={onChange} />);

    await user.click(screen.getByText("palavra"));

    expect(onChange).not.toHaveBeenCalled();
    expect(modal().getByRole("button", { name: "G" })).toHaveClass("bg-zinc-800");
    // indicador visual do cenário "editar" — cor diferente do de inserir,
    // no chip do CORPO.
    expect(screen.getByText("Editar acorde")).toBeDefined();
    expect(bodyChordButton("G").className).toMatch(/ring-sky-400/);
  });

  it("tocar no próprio acorde sempre seleciona (não insere), em qualquer posição", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness initialContent="[G]palavra" onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "G" }));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText("Editar acorde")).toBeDefined();
  });

  it("tocar de novo no mesmo acorde fecha o modal", async () => {
    const user = userEvent.setup();
    render(<Harness initialContent="[G]palavra" onChange={vi.fn()} />);

    await user.click(screen.getByText("palavra"));
    expect(screen.getByLabelText("Mover acorde para a esquerda")).toBeDefined();

    await user.click(screen.getByText("palavra"));
    expect(screen.queryByLabelText("Mover acorde para a esquerda")).toBeNull();
  });

  it("tocar no meio de uma palavra que já tem acorde divide e insere um acorde novo ali (achado em teste manual)", async () => {
    const onChange = vi.fn();
    render(<Harness initialContent="[D]palavra" onChange={onChange} />);

    // Simula o toque caindo exatamente no caractere de índice 3
    // ("pal[a]vra") — no meio da palavra que já pertence ao acorde D.
    Range.prototype.getBoundingClientRect = function (this: Range) {
      if (this.startOffset === 3) {
        return { left: 100, right: 110, top: 0, bottom: 20, width: 10, height: 20 } as DOMRect;
      }
      return { left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0 } as DOMRect;
    };

    fireEvent.click(screen.getByText("palavra"), { clientX: 105, clientY: 10 });

    // o D original continua antes de "pal"; nasce um D novo (tônica de D)
    // antes de "avra" — dois acordes separados, não editou o primeiro.
    expect(onChange).toHaveBeenCalledWith("[D]pal[D]avra");
    delete (Range.prototype as unknown as { getBoundingClientRect?: unknown }).getBoundingClientRect;
  });

  it("escolher outro acorde na grade troca só o acorde tocado (critério 6), modal continua aberto e reancorado", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness initialContent="[G]uma [A]outra" onChange={onChange} />);

    await user.click(screen.getByText("uma"));
    await user.click(modal().getByRole("button", { name: "Em" }));

    expect(onChange).toHaveBeenCalledWith("[Em]uma [A]outra");
    expect(modal().getByRole("button", { name: "Em" })).toHaveClass("bg-zinc-800");
    // a palavra "outra" (acorde A, intocada) continua exatamente como estava
    expect(screen.getByText("outra")).toBeDefined();
  });

  it("convenção (D8): aplica, troca e remove ao tocar de novo", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness initialContent="[D]letra" onChange={onChange} />);

    await user.click(screen.getByText("letra"));
    await user.click(screen.getByRole("button", { name: "Pausa" }));
    expect(onChange).toHaveBeenLastCalledWith("{c:Pausa}[D]letra");

    await user.click(screen.getByRole("button", { name: "Forte" }));
    expect(onChange).toHaveBeenLastCalledWith("{c:Forte}[D]letra");

    await user.click(screen.getByRole("button", { name: "Forte" }));
    expect(onChange).toHaveBeenLastCalledWith("[D]letra");
  });

  it("mover ◀ ▶ desabilita na borda da linha e desloca o acorde", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness initialContent="[D]ab" onChange={onChange} />);

    await user.click(screen.getByText("ab"));
    expect(screen.getByLabelText("Mover acorde para a esquerda")).toBeDisabled();
    expect(screen.getByLabelText("Mover acorde para a direita")).not.toBeDisabled();

    await user.click(screen.getByLabelText("Mover acorde para a direita"));
    expect(onChange).toHaveBeenCalledWith("a[D]b");
  });

  it("remover tira o acorde e fecha o modal, sem afetar a letra ao redor", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness initialContent="[D]letra" onChange={onChange} />);

    await user.click(screen.getByText("letra"));
    await user.click(screen.getByRole("button", { name: /Remover/ }));

    expect(onChange).toHaveBeenCalledWith("letra");
    expect(screen.queryByLabelText("Mover acorde para a esquerda")).toBeNull();
  });

  it("fechar (X) fecha o modal sem alterar o conteúdo", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness initialContent="[D]letra" onChange={onChange} />);

    await user.click(screen.getByText("letra"));
    await user.click(screen.getByLabelText("Fechar modal do acorde"));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByLabelText("Mover acorde para a esquerda")).toBeNull();
  });

  it("digitar um acorde válido no campo (desktop) aplica ao confirmar com Enter", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness initialContent="[D]letra" onChange={onChange} />);

    await user.click(screen.getByText("letra"));
    const input = screen.getByPlaceholderText("Digitar...");
    await user.type(input, "F#m7{Enter}");

    expect(onChange).toHaveBeenCalledWith("[F#m7]letra");
  });

  it("digitar um acorde inválido mostra aviso e não altera nada", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness initialContent="[D]letra" onChange={onChange} />);

    await user.click(screen.getByText("letra"));
    const input = screen.getByPlaceholderText("Digitar...");
    await user.type(input, "xyz{Enter}");

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText("Acorde inválido")).toBeDefined();
  });

  describe("posição exata do toque (correção do bug 'acorde na letra errada')", () => {
    afterEach(() => {
      delete (Range.prototype as unknown as { getBoundingClientRect?: unknown }).getBoundingClientRect;
    });

    it("insere o acorde na letra exata tocada, não na seguinte", () => {
      const onChange = vi.fn();
      render(<Harness initialContent="palavra" onChange={onChange} />);

      // Caractere de índice 3 ("pal[a]vra") é o único com caixa real.
      Range.prototype.getBoundingClientRect = function (this: Range) {
        if (this.startOffset === 3) {
          return { left: 100, right: 110, top: 0, bottom: 20, width: 10, height: 20 } as DOMRect;
        }
        return { left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0 } as DOMRect;
      };

      fireEvent.click(screen.getByText("palavra"), { clientX: 105, clientY: 10 });

      expect(onChange).toHaveBeenCalledWith("pal[D]avra");
    });
  });

  it("D9: a grade nasce sempre do baseKey recebido, nunca transposta", async () => {
    const user = userEvent.setup();
    render(<Harness initialContent="palavra" baseKey="A" onChange={vi.fn()} />);

    await user.click(screen.getByText("palavra"));
    expect(modal().getByRole("button", { name: "A" })).toHaveClass("bg-zinc-800");
  });
});

async function openTextToggle(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByLabelText("Mais opções do bloco"));
}

describe("BlockShell — modo texto, bloco vazio/inválido (Etapa 5, critério 10)", () => {
  it("bloco vazio (content: \"\") abre direto em modo texto", () => {
    render(<Harness initialContent="" onChange={vi.fn()} />);
    expect(screen.getByRole("textbox")).toBeDefined();
  });

  it("bloco com erro de parse abre direto em modo texto, com o aviso ao lado", () => {
    render(<Harness initialContent="{incompleto" onChange={vi.fn()} />);
    expect(screen.getByRole("textbox")).toHaveValue("{incompleto");
    expect(screen.getByText("Messages.invalidChordPro")).toBeDefined();
  });

  it("bloco válido e não vazio abre direto em modo visual", () => {
    render(<Harness initialContent="[D]letra" onChange={vi.fn()} />);
    expect(screen.getByText("letra")).toBeDefined();
    expect(screen.queryByRole("textbox")).toBeNull();
  });

  it("bloco TEXT sempre usa MarkdownUnitForm, mesmo vazio, e não tem o item de alternar modo", async () => {
    const user = userEvent.setup();
    render(<Harness initialContent="" type="TEXT" onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText("UnitData.markdownPlaceholder")).toBeDefined();

    await openTextToggle(user);
    expect(screen.queryByText(/Editar como texto|Editar visual/)).toBeNull();
  });

  it("ida e volta entre modo texto e visual não perde nada (alternando pelo menu)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness initialContent="[D]letra" onChange={onChange} />);

    await openTextToggle(user);
    await user.click(screen.getByText("Editar como texto"));
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveValue("[D]letra");

    await user.clear(textarea);
    // userEvent.type usa [ pra iniciar uma sequência especial de teclado —
    // [[ produz o colchete de abertura literal; ] sozinho já é literal.
    await user.type(textarea, "[[D]letra mais");
    expect(onChange).toHaveBeenLastCalledWith("[D]letra mais");

    await openTextToggle(user);
    await user.click(screen.getByText("Editar visual"));

    expect(screen.queryByRole("textbox")).toBeNull();
    expect(screen.getByText("letra")).toBeDefined();
    expect(screen.getByText("mais")).toBeDefined();
  });
});
