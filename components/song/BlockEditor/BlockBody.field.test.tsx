import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";
import BlockBody from "./BlockBody";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

beforeAll(() => {
  // jsdom não tem ResizeObserver (o corpo mede a largura do bloco).
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

async function openChordPanel(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "G" }));
  return screen.findByLabelText("Campo harmônico");
}

describe("BlockBody — campo harmônico no modal de acordes", () => {
  it("o seletor começa no tom da cifra e a grade é a desse tom", async () => {
    const user = userEvent.setup();
    render(<BlockBody content="[G]Aleluia" baseKey="G" onChangeContent={vi.fn()} />);
    const select = (await openChordPanel(user)) as HTMLSelectElement;
    expect(select.value).toBe("G");
    expect(screen.getByRole("option", { name: "G" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Em" })).toBeDefined(); // VIm de G
  });

  it("trocar o campo muda a grade, sem alterar o conteúdo nem o tom da cifra", async () => {
    const user = userEvent.setup();
    const onChangeContent = vi.fn();
    render(<BlockBody content="[G]Aleluia" baseKey="G" onChangeContent={onChangeContent} />);
    const select = (await openChordPanel(user)) as HTMLSelectElement;

    await user.selectOptions(select, "D");

    expect(select.value).toBe("D");
    expect(screen.getByRole("button", { name: "Bm" })).toBeDefined(); // VIm de D
    expect(screen.getByRole("button", { name: "F#m" })).toBeDefined(); // IIIm de D
    expect(screen.queryByRole("button", { name: "C" })).toBeNull(); // C (IV) é só do campo de G
    expect(onChangeContent).not.toHaveBeenCalled();
  });

  it("escolher um acorde do outro campo grava só aquele acorde", async () => {
    const user = userEvent.setup();
    const onChangeContent = vi.fn();
    render(<BlockBody content="[G]Aleluia" baseKey="G" onChangeContent={onChangeContent} />);
    const select = (await openChordPanel(user)) as HTMLSelectElement;
    await user.selectOptions(select, "D");
    await user.click(screen.getByRole("button", { name: "Bm" }));
    expect(onChangeContent).toHaveBeenCalledTimes(1);
    expect(onChangeContent.mock.calls[0][0]).toBe("[Bm]Aleluia");
  });
});
