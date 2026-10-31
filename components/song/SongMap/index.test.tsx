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
      />
    );
    const chips = screen.getAllByRole("button");
    expect(chips.map((c) => c.textContent)).toEqual(["I", "V1", "R1", "V2", "R2"]);
  });

  it("rótulo acessível e title têm o nome completo com número", () => {
    render(<SongMap units={[{ type: "CHORUS" }, { type: "CHORUS" }]} />);
    expect(screen.getByRole("button", { name: "Refrão 2" })).toBeDefined();
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
