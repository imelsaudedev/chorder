import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import SongMap from "./index";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      "SongMap.label": "Mapa da música",
      "UnitTypes.INTRO": "Intro",
      "UnitTypes.VERSE": "Verso",
      "UnitTypes.CHORUS": "Refrão",
      "UnitTypesShort.INTRO": "I",
      "UnitTypesShort.VERSE": "V",
      "UnitTypesShort.CHORUS": "R",
    };
    return map[key] ?? key;
  },
}));

describe("SongMap", () => {
  it("espelha os blocos na ordem, sem deduplicar repetições (protótipo: I, V1, R1, V2, R2)", () => {
    render(
      <SongMap
        units={[
          { type: "INTRO" },
          { type: "VERSE" },
          { type: "CHORUS" },
          { type: "VERSE" },
          { type: "CHORUS" },
        ]}
        onSelectUnit={() => {}}
      />
    );
    const chips = screen.getAllByRole("button");
    expect(chips.map((c) => c.textContent)).toEqual(["I", "V1", "R1", "V2", "R2"]);
  });

  it("rótulo acessível e title têm o nome completo com número", () => {
    render(<SongMap units={[{ type: "CHORUS" }, { type: "CHORUS" }]} onSelectUnit={() => {}} />);
    expect(screen.getByRole("button", { name: "Refrão 2" })).toBeDefined();
  });

  it("sem onSelectUnit os chips são só informação (não são botões)", () => {
    render(<SongMap units={[{ type: "VERSE" }, { type: "CHORUS" }]} />);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
    expect(screen.getByLabelText("Verso 1").textContent).toBe("V1");
  });

  it("fit: mostra todos os chips numa linha só, sem rolagem horizontal", () => {
    const units = Array.from({ length: 20 }, (_, i) => ({ type: i % 2 ? ("CHORUS" as const) : ("VERSE" as const) }));
    render(<SongMap fit units={units} />);
    const group = screen.getByRole("group");
    // sem rolagem no celular; só de lg pra cima (lg:overflow-x-auto) quando não couber
    expect(group.className).not.toMatch(/(^|\s)overflow-x-auto/);
    expect(group.children).toHaveLength(20);
  });

  it("tocar um chip chama onSelectUnit com o índice certo", async () => {
    const user = userEvent.setup();
    const onSelectUnit = vi.fn();
    render(
      <SongMap
        units={[{ type: "INTRO" }, { type: "VERSE" }]}
        onSelectUnit={onSelectUnit}
      />
    );
    await user.click(screen.getByRole("button", { name: "Verso 1" }));
    expect(onSelectUnit).toHaveBeenCalledWith(1);
  });

  it("não renderiza nada sem unidades", () => {
    const { container } = render(<SongMap units={[]} />);
    expect(container.firstChild).toBeNull();
  });
});

describe("SongMap — reordenar na edição", () => {
  const units = [{ type: "INTRO" as const }, { type: "VERSE" as const }, { type: "CHORUS" as const }];

  it("com onMoveUnit os chips ganham o nome 'Ir para …' (não repetem o botão de tipo do bloco)", () => {
    render(<SongMap units={units} onSelectUnit={() => {}} onMoveUnit={() => {}} />);
    expect(screen.getByRole("button", { name: /SongMap\.goTo.*Verso 1/ })).toBeDefined();
    expect(screen.queryByRole("button", { name: "Verso 1" })).toBeNull();
  });

  it("Alt+→ move o bloco do chip focado uma posição pra frente, Alt+← pra trás", async () => {
    const user = userEvent.setup();
    const onMoveUnit = vi.fn();
    render(<SongMap units={units} onSelectUnit={() => {}} onMoveUnit={onMoveUnit} />);
    const verse = screen.getByRole("button", { name: /Verso 1/ });
    verse.focus();
    await user.keyboard("{Alt>}{ArrowRight}{/Alt}");
    expect(onMoveUnit).toHaveBeenLastCalledWith(1, 2);
    await user.keyboard("{Alt>}{ArrowLeft}{/Alt}");
    expect(onMoveUnit).toHaveBeenLastCalledWith(1, 0);
  });

  it("tocar num chip reordenável ainda rola até o bloco", async () => {
    const user = userEvent.setup();
    const onSelectUnit = vi.fn();
    render(<SongMap units={units} onSelectUnit={onSelectUnit} onMoveUnit={() => {}} />);
    await user.click(screen.getByRole("button", { name: /Refrão 1|Refr.o 1/ }));
    expect(onSelectUnit).toHaveBeenCalledWith(2);
  });
});
