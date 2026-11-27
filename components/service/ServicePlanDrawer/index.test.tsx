import messages from "@/i18n/messages/pt-BR.json";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { beforeAll, describe, expect, it, vi } from "vitest";
import ServicePlanDrawer from "./index";

vi.mock("@/app/api/api-client", () => ({
  useFetchPeople: () => ({ people: [], isLoading: false }),
  useFetchServicesList: () => ({ services: [] }),
  useFetchTemplates: () => ({ templates: [], isLoading: false }),
}));

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

function renderDrawer(props: Partial<React.ComponentProps<typeof ServicePlanDrawer>> = {}) {
  const onSave = vi.fn(() => false as const);
  render(
    <NextIntlClientProvider locale="pt-BR" messages={messages} timeZone="America/Sao_Paulo">
      <ServicePlanDrawer
        open
        onOpenChange={() => {}}
        onSave={onSave}
        defaultValues={{
          title: "Culto",
          worshipLeader: "Ana Souza",
          leaders: [{ userId: "ana", name: "Ana Souza" }],
          date: new Date(2026, 11, 6, 10, 30),
        }}
        {...props}
      />
    </NextIntlClientProvider>
  );
  return onSave;
}

describe("ServicePlanDrawer (editar dados)", () => {
  it("não pede pregador: ele fica só no item Sermão do roteiro", () => {
    renderDrawer();
    expect(screen.queryByText("Pregador")).toBeNull();
  });

  it("todos os campos da edição têm a mesma altura (44px, h-11) e o mesmo espaçamento entre eles", () => {
    renderDrawer({ defaultValues: { title: "Culto", date: new Date(2026, 11, 6, 10, 30) } });
    const title = screen.getByPlaceholderText(/Título da liturgia/i);
    const date = screen.getByRole("button", { name: /dez/i });
    const time = screen.getByDisplayValue("10:30");
    expect(title.className).toContain("h-11");
    expect(date.className).toContain("h-11");
    expect(time.className).toContain("h-11");
    // o dirigente (campo de pessoas) também tem 44px
    for (const box of document.querySelectorAll("[cmdk-root] > div")) {
      expect((box as HTMLElement).className).toContain("min-h-11");
    }
    // os campos ficam numa coluna com o mesmo vão (gap-5)
    expect(title.closest(".gap-5")).not.toBeNull();
  });

  it("salva título, data e hora e dirigentes na mesma configuração", async () => {
    const onSave = renderDrawer();
    const save = screen.getByRole("button", { name: /salvar/i });
    await waitFor(() => expect(save).toBeEnabled());
    fireEvent.click(save);
    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Culto",
        worshipLeader: "Ana Souza",
        leaders: [{ userId: "ana", name: "Ana Souza" }],
      })
    );
    const config = onSave.mock.calls[0] as unknown as [{ date: Date }];
    expect(config[0].date.getHours()).toBe(10);
    expect(config[0].date.getMinutes()).toBe(30);
  });
});
