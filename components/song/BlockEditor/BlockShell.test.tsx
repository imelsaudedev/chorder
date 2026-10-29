import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
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

describe("BlockShell — ponte entre toque, block-model e o modal (Etapa 4)", () => {
  it("8.4: tocar numa palavra sem acorde insere o acorde do tom (I) e abre o modal", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness initialContent="palavra" onChange={onChange} />);

    await user.click(screen.getByText("palavra"));

    expect(onChange).toHaveBeenCalledWith("[D]palavra");
    expect(screen.getByRole("button", { name: "D" })).toHaveClass("bg-zinc-800");
  });

  it("8.4: tocar numa palavra que já tem acorde só seleciona, sem mudar o conteúdo", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness initialContent="[G]palavra" onChange={onChange} />);

    await user.click(screen.getByText("palavra"));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "G" })).toHaveClass("bg-zinc-800");
  });

  it("tocar de novo no mesmo acorde fecha o modal", async () => {
    const user = userEvent.setup();
    render(<Harness initialContent="[G]palavra" onChange={vi.fn()} />);

    await user.click(screen.getByText("palavra"));
    expect(screen.getByLabelText("Mover acorde para a esquerda")).toBeDefined();

    await user.click(screen.getByText("palavra"));
    expect(screen.queryByLabelText("Mover acorde para a esquerda")).toBeNull();
  });

  it("escolher outro acorde na grade troca só o acorde tocado (critério 6), modal continua aberto e reancorado", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness initialContent="[G]uma [A]outra" onChange={onChange} />);

    await user.click(screen.getByText("uma"));
    await user.click(screen.getByRole("button", { name: "Em" }));

    expect(onChange).toHaveBeenCalledWith("[Em]uma [A]outra");
    expect(screen.getByRole("button", { name: "Em" })).toHaveClass("bg-zinc-800");
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

  it("D9: a grade nasce sempre do baseKey recebido, nunca transposta", async () => {
    const user = userEvent.setup();
    render(<Harness initialContent="palavra" baseKey="A" onChange={vi.fn()} />);

    await user.click(screen.getByText("palavra"));
    expect(screen.getByRole("button", { name: "A" })).toHaveClass("bg-zinc-800");
  });
});
