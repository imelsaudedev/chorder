import messages from "@/i18n/messages/pt-BR.json";
import type { ClientServiceUnit } from "@/prisma/models";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { SermaoUnitForm } from "./ServiceItemForms";
import { PlanModeProvider } from "./planMode";

vi.mock("@/app/api/api-client", () => ({
  // como o servidor: só devolve quem casa com a busca
  useFetchPeople: (q: string) => ({
    people: [{ id: "ana", name: "Ana Souza", image: null }].filter((p) => p.name.toLowerCase().includes(q.toLowerCase())),
    isLoading: false,
  }),
}));

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

const unit = (metadata: object | null = null): ClientServiceUnit =>
  ({ clientId: "u1", type: "SERMAO", order: 1, label: null, metadata, durationMin: null, semitoneTranspose: 0 }) as never;

function renderForm(u: ClientServiceUnit, mode: "plan" | "template" = "plan") {
  const onUpdate = vi.fn();
  const { container } = render(
    <NextIntlClientProvider locale="pt-BR" messages={messages}>
      <PlanModeProvider value={mode}>
        <SermaoUnitForm unit={u} isNew={false} onUpdate={onUpdate} onDiscard={() => {}} onDone={() => {}} />
      </PlanModeProvider>
    </NextIntlClientProvider>
  );
  return { onUpdate, form: container.querySelector("form") as HTMLFormElement };
}

describe("SermaoUnitForm (pregador no item)", () => {
  it("escolhe o pregador entre as pessoas do sistema e guarda a conta no item", () => {
    const { onUpdate, form } = renderForm(unit());
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.click(screen.getByRole("option", { name: /Ana Souza/ }));
    fireEvent.submit(form);
    expect(onUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({ metadata: expect.objectContaining({ preacher: "Ana Souza", preacherId: "ana" }) })
    );
  });

  it("nome digitado (convidado) fica sem conta", async () => {
    const { onUpdate, form } = renderForm(unit());
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "Pr. Convidado" } });
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(1)); // a busca espera 200ms
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.submit(form);
    expect(onUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({ metadata: expect.objectContaining({ preacher: "Pr. Convidado", preacherId: null }) })
    );
  });

  it("item antigo, só com o nome, abre com o pregador como nome sem conta", () => {
    renderForm(unit({ preacher: "Pr. João", reference: "Rm 8" }));
    expect(screen.getByText("Pr. João")).toBeTruthy();
    expect(screen.getByTitle("Sem conta")).toBeTruthy();
  });

  it("no culto o pregador é necessário enquanto está vazio; no modelo, não", () => {
    renderForm(unit());
    expect(screen.getByText(/necessário/)).toBeTruthy();
  });

  it("no modelo, o pregador não é cobrado", () => {
    renderForm(unit(), "template");
    expect(screen.queryByText(/necessário/)).toBeNull();
  });
});
