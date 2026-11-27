import messages from "@/i18n/messages/pt-BR.json";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { beforeAll, describe, expect, it, vi } from "vitest";
import ServiceMetaModal from "./index";

vi.mock("@/app/api/api-client", () => ({ useFetchPeople: () => ({ people: [], isLoading: false }) }));

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

describe("ServiceMetaModal (Editar dados, na lista)", () => {
  it("abre com as pessoas que já conduzem e salva a lista com o texto derivado", async () => {
    const onSave = vi.fn(() => false as const);
    render(
      <NextIntlClientProvider locale="pt-BR" messages={messages}>
        <ServiceMetaModal
          open
          onOpenChange={() => {}}
          onSave={onSave}
          defaultValues={{
            title: "Culto",
            worshipLeader: "Ana Souza",
            leaders: [{ userId: "ana", name: "Ana Souza" }],
            date: new Date(2026, 11, 6, 10, 0),
          }}
        />
      </NextIntlClientProvider>
    );

    expect(screen.getByText("Ana Souza")).toBeTruthy();

    // soma um dirigente sem conta
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "Visitante" } });
    await screen.findByRole("option", { name: /Visitante/ });
    fireEvent.keyDown(input, { key: "Enter" });

    fireEvent.click(screen.getByRole("button", { name: /salvar/i }));
    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Culto",
        worshipLeader: "Ana Souza e Visitante",
        leaders: [
          { userId: "ana", name: "Ana Souza" },
          { userId: null, name: "Visitante" },
        ],
      })
    );
  });

  it("culto antigo, só com o texto, abre com um dirigente sem conta", () => {
    render(
      <NextIntlClientProvider locale="pt-BR" messages={messages}>
        <ServiceMetaModal
          open
          onOpenChange={() => {}}
          onSave={() => false}
          defaultValues={{ title: "Culto", worshipLeader: "Hugo", date: new Date(2026, 11, 6) }}
        />
      </NextIntlClientProvider>
    );
    expect(screen.getByTitle("Sem conta")).toBeTruthy();
    expect(screen.getByText("Hugo")).toBeTruthy();
  });
});
