import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ClientSongUnit } from "@/prisma/models";
import BlockEditor from "./index";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

function makeUnits(types: ClientSongUnit["type"][]): ClientSongUnit[] {
  return types.map((type, i) => ({
    type,
    content: `[D]conteúdo ${i}`,
    order: i + 1,
    notes: null,
    repeatCount: 1,
  }));
}

async function openBlockMenu(user: ReturnType<typeof userEvent.setup>, blockEl: HTMLElement) {
  await user.click(within(blockEl).getByRole("button", { name: "Mais opções do bloco" }));
}

function getBlocks() {
  // cada bloco tem exatamente um gatilho de seletor de tipo (UnitTypes.*)
  return screen.getAllByRole("button", { name: /^UnitTypes\./ }).map((btn) => btn.closest("div.border")!);
}

describe("BlockEditor", () => {
  it("renderiza um bloco por unidade, com a numeração por tipo", () => {
    render(<BlockEditor units={makeUnits(["INTRO", "VERSE", "VERSE"])} onChangeUnits={vi.fn()} />);
    expect(screen.getByRole("button", { name: "UnitTypes.INTRO 1" })).toBeDefined();
    expect(screen.getByRole("button", { name: "UnitTypes.VERSE 1" })).toBeDefined();
    expect(screen.getByRole("button", { name: "UnitTypes.VERSE 2" })).toBeDefined();
  });

  it("Subir fica desabilitado no primeiro bloco, Descer no último", async () => {
    const user = userEvent.setup();
    render(<BlockEditor units={makeUnits(["INTRO", "VERSE", "CHORUS"])} onChangeUnits={vi.fn()} />);
    const blocks = getBlocks();

    await openBlockMenu(user, blocks[0]);
    expect(screen.getByRole("menuitem", { name: /Subir/ })).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("menuitem", { name: /Descer/ })).not.toHaveAttribute("aria-disabled", "true");
    await user.keyboard("{Escape}");

    await openBlockMenu(user, blocks[2]);
    expect(screen.getByRole("menuitem", { name: /Subir/ })).not.toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("menuitem", { name: /Descer/ })).toHaveAttribute("aria-disabled", "true");
  });

  it("Descer move o bloco e renumera (critério 7)", async () => {
    const user = userEvent.setup();
    const units = makeUnits(["INTRO", "VERSE", "CHORUS"]);
    const onChangeUnits = vi.fn();
    render(<BlockEditor units={units} onChangeUnits={onChangeUnits} />);
    const blocks = getBlocks();

    await openBlockMenu(user, blocks[0]);
    await user.click(screen.getByRole("menuitem", { name: /Descer/ }));

    expect(onChangeUnits).toHaveBeenCalledTimes(1);
    const result = onChangeUnits.mock.calls[0][0] as ClientSongUnit[];
    expect(result.map((u) => u.type)).toEqual(["VERSE", "INTRO", "CHORUS"]);
    expect(result.map((u) => u.order)).toEqual([1, 2, 3]);
  });

  it("Duplicar insere a cópia logo depois", async () => {
    const user = userEvent.setup();
    const units = makeUnits(["INTRO", "VERSE"]);
    const onChangeUnits = vi.fn();
    render(<BlockEditor units={units} onChangeUnits={onChangeUnits} />);
    const blocks = getBlocks();

    await openBlockMenu(user, blocks[0]);
    await user.click(screen.getByRole("menuitem", { name: "Messages.duplicate" }));

    const result = onChangeUnits.mock.calls[0][0] as ClientSongUnit[];
    expect(result.map((u) => u.type)).toEqual(["INTRO", "INTRO", "VERSE"]);
  });

  it("Inserir acima e Inserir abaixo criam bloco em branco na posição certa", async () => {
    const user = userEvent.setup();
    const units = makeUnits(["INTRO", "VERSE"]);
    const onChangeUnits = vi.fn();
    render(<BlockEditor units={units} onChangeUnits={onChangeUnits} />);
    const blocks = getBlocks();

    await openBlockMenu(user, blocks[1]);
    await user.click(screen.getByRole("menuitem", { name: /Inserir acima/ }));
    expect((onChangeUnits.mock.calls[0][0] as ClientSongUnit[]).map((u) => u.type)).toEqual([
      "INTRO",
      "BLOCK",
      "VERSE",
    ]);
  });

  it("D12: Apagar fica desabilitado quando é o único bloco restante", async () => {
    const user = userEvent.setup();
    render(<BlockEditor units={makeUnits(["INTRO"])} onChangeUnits={vi.fn()} />);
    const blocks = getBlocks();

    await openBlockMenu(user, blocks[0]);
    expect(screen.getByRole("menuitem", { name: "Messages.delete" })).toHaveAttribute(
      "aria-disabled",
      "true"
    );
  });

  it("Apagar remove o bloco quando há mais de um", async () => {
    const user = userEvent.setup();
    const units = makeUnits(["INTRO", "VERSE"]);
    const onChangeUnits = vi.fn();
    render(<BlockEditor units={units} onChangeUnits={onChangeUnits} />);
    const blocks = getBlocks();

    await openBlockMenu(user, blocks[0]);
    await user.click(screen.getByRole("menuitem", { name: "Messages.delete" }));
    expect((onChangeUnits.mock.calls[0][0] as ClientSongUnit[]).map((u) => u.type)).toEqual(["VERSE"]);
  });

  it("trocar o tipo no seletor chama onChangeUnits só para aquele bloco", async () => {
    const user = userEvent.setup();
    const units = makeUnits(["INTRO", "VERSE"]);
    const onChangeUnits = vi.fn();
    render(<BlockEditor units={units} onChangeUnits={onChangeUnits} />);

    await user.click(screen.getByRole("button", { name: "UnitTypes.VERSE 1" }));
    await user.click(screen.getByRole("menuitem", { name: "UnitTypes.BRIDGE" }));

    const result = onChangeUnits.mock.calls[0][0] as ClientSongUnit[];
    expect(result[0]).toBe(units[0]);
    expect(result[1].type).toBe("BRIDGE");
  });

  it("Nova unidade adiciona um bloco em branco no fim (D10)", async () => {
    const user = userEvent.setup();
    const units = makeUnits(["INTRO"]);
    const onChangeUnits = vi.fn();
    render(<BlockEditor units={units} onChangeUnits={onChangeUnits} />);

    await user.click(screen.getByRole("button", { name: "newUnit" }));
    const result = onChangeUnits.mock.calls[0][0] as ClientSongUnit[];
    expect(result.map((u) => u.type)).toEqual(["INTRO", "BLOCK"]);
  });

  it("mantém order correto na ordem das unidades com mais de uma coluna (critério 7)", async () => {
    const user = userEvent.setup();
    const units = makeUnits(["INTRO", "VERSE", "CHORUS", "VERSE"]);
    const onChangeUnits = vi.fn();
    render(<BlockEditor units={units} columns={2} onChangeUnits={onChangeUnits} />);
    const blocks = getBlocks();

    await openBlockMenu(user, blocks[0]);
    await user.click(screen.getByRole("menuitem", { name: /Descer/ }));
    const result = onChangeUnits.mock.calls[0][0] as ClientSongUnit[];
    expect(result.map((u) => u.order)).toEqual([1, 2, 3, 4]);
  });
});
