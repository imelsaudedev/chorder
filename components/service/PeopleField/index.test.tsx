import messages from "@/i18n/messages/pt-BR.json";
import type { ServiceLeaderEntry } from "@/lib/service-leaders";
import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import PeopleField from "./index";

vi.mock("@/app/api/api-client", () => ({
  useFetchPeople: (q: string) => ({
    people: [
      { id: "ana", name: "Ana Souza", image: null },
      { id: "hugo", name: "Hugo Lima", image: null },
    ].filter((p) => p.name.toLowerCase().includes(q.toLowerCase())),
    isLoading: false,
  }),
}));

function Harness({ initial = [], max }: { initial?: ServiceLeaderEntry[]; max?: number }) {
  const [value, setValue] = useState(initial);
  return (
    <NextIntlClientProvider locale="pt-BR" messages={messages}>
      <PeopleField value={value} onChange={setValue} max={max} placeholder="Buscar" />
      <output data-testid="value">{JSON.stringify(value)}</output>
    </NextIntlClientProvider>
  );
}

const value = () => JSON.parse(screen.getByTestId("value").textContent ?? "[]");

describe("PeopleField", () => {
  it("escolhe uma pessoa da lista e depois outra (vários dirigentes)", () => {
    render(<Harness />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.mouseDown(screen.getByRole("button", { name: /Ana Souza/ }));
    fireEvent.focus(input);
    fireEvent.mouseDown(screen.getByRole("button", { name: /Hugo Lima/ }));
    expect(value()).toEqual([
      { userId: "ana", name: "Ana Souza" },
      { userId: "hugo", name: "Hugo Lima" },
    ]);
  });

  it("Enter adiciona um nome sem conta, e não repete quem já está", () => {
    render(<Harness initial={[{ userId: "ana", name: "Ana Souza" }]} />);
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "Visitante" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(value()).toEqual([
      { userId: "ana", name: "Ana Souza" },
      { userId: null, name: "Visitante" },
    ]);
    fireEvent.change(input, { target: { value: "ana souza" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(value()).toHaveLength(2);
  });

  it("remove pelo X e com Backspace no campo vazio", () => {
    render(
      <Harness
        initial={[
          { userId: "ana", name: "Ana Souza" },
          { userId: null, name: "Visitante" },
        ]}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Remover Visitante" }));
    expect(value()).toEqual([{ userId: "ana", name: "Ana Souza" }]);
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "Backspace" });
    expect(value()).toEqual([]);
  });

  it("escolha única (pregador): a pessoa escolhida esconde o campo e remover o devolve", () => {
    render(<Harness max={1} initial={[{ userId: "hugo", name: "Hugo Lima" }]} />);
    expect(screen.queryByRole("combobox")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Remover Hugo Lima" }));
    expect(screen.getByRole("combobox")).toBeTruthy();
  });
});
