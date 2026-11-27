import messages from "@/i18n/messages/pt-BR.json";
import type { ServiceLeaderEntry } from "@/lib/service-leaders";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { useState } from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import PeopleField from "./index";

vi.mock("@/app/api/api-client", () => ({
  useFetchPeople: (q: string) => ({
    people: [
      { id: "hugo", name: "Hugo Lima", image: null, recent: true },
      { id: "ana", name: "Ana Souza", image: null },
      { id: "caio", name: "Caio Álvares", image: null },
    ].filter((p) => p.name.toLowerCase().includes(q.toLowerCase())),
    isLoading: false,
  }),
}));

beforeAll(() => {
  // o cmdk rola o item marcado para a vista; o jsdom não implementa
  Element.prototype.scrollIntoView = vi.fn();
});

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
const input = () => screen.getByRole("combobox");
const announcement = () => screen.getByTestId("people-announcement").textContent ?? "";
// a busca espera 200ms depois da digitação; os testes esperam a lista acompanhar o texto
const optionNames = () => screen.queryAllByRole("option").map((o) => o.lastElementChild?.textContent ?? o.textContent ?? "");

describe("PeopleField", () => {
  it("campo vazio mostra primeiro quem conduziu recentemente, depois as demais pessoas", () => {
    render(<Harness />);
    fireEvent.focus(input());
    expect(screen.getByText("Conduziram recentemente")).toBeTruthy();
    expect(screen.getByRole("listbox", { name: "Sugestões de pessoas" })).toBeTruthy();
    expect(optionNames()).toEqual(["Hugo Lima", "Ana Souza", "Caio Álvares"]);
  });

  it("escolhe por clique e depois por Enter (vários dirigentes), anunciando para leitor de tela", () => {
    render(<Harness />);
    fireEvent.focus(input());
    fireEvent.click(screen.getByRole("option", { name: /Ana Souza/ }));
    expect(value()).toEqual([{ userId: "ana", name: "Ana Souza" }]);

    fireEvent.focus(input());
    fireEvent.keyDown(input(), { key: "ArrowDown" });
    fireEvent.keyDown(input(), { key: "Enter" });
    expect(value()).toHaveLength(2);
    expect(announcement()).toContain("adicionada");
  });

  it("digitar um nome sem correspondência oferece adicionar sem conta, e Enter adiciona", async () => {
    render(<Harness initial={[{ userId: "ana", name: "Ana Souza" }]} />);
    fireEvent.change(input(), { target: { value: "Visitante" } });
    await waitFor(() => expect(optionNames()).toHaveLength(1));
    expect(screen.getByRole("option", { name: /Visitante/ })).toBeTruthy();
    fireEvent.keyDown(input(), { key: "Enter" });
    expect(value()).toEqual([
      { userId: "ana", name: "Ana Souza" },
      { userId: null, name: "Visitante" },
    ]);
    // o nome sem conta fica marcado no chip
    expect(screen.getByTitle("Sem conta")).toBeTruthy();
  });

  it("não oferece adicionar quem já está na lista", async () => {
    render(<Harness initial={[{ userId: null, name: "Visitante" }]} />);
    fireEvent.change(input(), { target: { value: "visitante" } });
    await screen.findByText("Nenhuma pessoa encontrada");
    expect(screen.queryByRole("option", { name: /Adicionar/ })).toBeNull();
  });

  it("sem resultado e sem nada a adicionar, avisa que ninguém foi encontrado", async () => {
    render(<Harness initial={[{ userId: null, name: "Zé" }]} />);
    fireEvent.change(input(), { target: { value: "ze" } }); // o mock não acha ninguém, e "Zé" já está na lista
    expect(await screen.findByText("Nenhuma pessoa encontrada")).toBeTruthy();
  });

  it("Backspace em dois passos: o primeiro marca o último chip, o segundo remove", () => {
    render(
      <Harness
        initial={[
          { userId: "ana", name: "Ana Souza" },
          { userId: null, name: "Visitante" },
        ]}
      />
    );
    fireEvent.keyDown(input(), { key: "Backspace" });
    expect(value()).toHaveLength(2);
    fireEvent.keyDown(input(), { key: "Backspace" });
    expect(value()).toEqual([{ userId: "ana", name: "Ana Souza" }]);
    expect(announcement()).toContain("removida");
  });

  it("remove pelo X", () => {
    render(<Harness initial={[{ userId: "ana", name: "Ana Souza" }]} />);
    fireEvent.click(screen.getByRole("button", { name: "Remover Ana Souza" }));
    expect(value()).toEqual([]);
  });

  it("escolha única (pregador): a pessoa fica no campo, sem busca, e Trocar libera a busca", () => {
    render(<Harness max={1} initial={[{ userId: "hugo", name: "Hugo Lima" }]} />);
    expect(screen.queryByRole("combobox")).toBeNull();
    expect(screen.getByText("Hugo Lima")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Trocar" }));
    expect(value()).toEqual([]);
    expect(screen.getByRole("combobox")).toBeTruthy();
  });

  it("segue o Input do sistema: id para o rótulo, borda de erro e altura por tamanho", () => {
    const { container, rerender } = render(
      <NextIntlClientProvider locale="pt-BR" messages={messages}>
        <PeopleField value={[]} onChange={() => {}} placeholder="Buscar" id="campo" aria-invalid="true" />
      </NextIntlClientProvider>
    );
    expect(input().id).toBe("campo"); // clicar no rótulo foca o campo
    const box = container.querySelector("[aria-invalid]") as HTMLElement;
    expect(box.className).toContain("border-input");
    expect(box.className).toContain("min-h-9"); // 36px, como o Input padrão

    rerender(
      <NextIntlClientProvider locale="pt-BR" messages={messages}>
        <PeopleField value={[]} onChange={() => {}} placeholder="Buscar" size="lg" />
      </NextIntlClientProvider>
    );
    expect(container.querySelector(".min-h-11")).not.toBeNull(); // 44px, como os campos da gaveta (h-11)
  });
});
