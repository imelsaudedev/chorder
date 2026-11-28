import messages from "@/i18n/messages/pt-BR.json";
import type { ClientService } from "@/prisma/models";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";
import ServicePlanHeader from "./ServicePlanHeader";

const base: ClientService = {
  slug: "culto",
  title: "Culto",
  worshipLeader: "Ana Souza e Hugo Lima",
  date: new Date(2026, 11, 6, 10, 0),
  isDeleted: false,
  plan: { startTime: "10:00", sections: [] },
};

function renderHeader(service: ClientService) {
  return render(
    <NextIntlClientProvider locale="pt-BR" messages={messages} timeZone="America/Sao_Paulo">
      <ServicePlanHeader service={service} onEdit={() => {}} />
    </NextIntlClientProvider>
  );
}

describe("ServicePlanHeader (edição do roteiro)", () => {
  it("culto salvo: foto (ou iniciais) de cada dirigente ao lado do nome, sem ícone de microfone", () => {
    const { container } = renderHeader({
      ...base,
      leaders: [
        { userId: "ana", name: "Ana Souza" },
        { userId: null, name: "Hugo Lima" },
      ],
      leaderPeople: [
        { userId: "ana", name: "Ana Souza", image: null },
        { userId: null, name: "Hugo Lima", image: null },
      ],
    });
    expect(screen.getByText(/Ana Souza e Hugo Lima/)).toBeInTheDocument();
    expect(screen.getByText("AS")).toBeInTheDocument();
    expect(screen.getByText("HL")).toBeInTheDocument();
    expect(container.querySelector(".lucide-mic-vocal")).toBeNull();
  });

  it("culto novo, só com as pessoas escolhidas na gaveta: mostra as iniciais", () => {
    renderHeader({ ...base, worshipLeader: "Ana Souza", leaders: [{ userId: "ana", name: "Ana Souza" }] });
    expect(screen.getByText("AS")).toBeInTheDocument();
  });

  it("culto antigo, só com o texto: mostra o nome, sem avatar", () => {
    renderHeader({ ...base, worshipLeader: "Rafael", leaders: [{ userId: null, name: "Rafael" }], leaderPeople: [] });
    expect(screen.getByText("Rafael")).toBeInTheDocument();
    expect(screen.queryByText("R")).toBeNull();
  });
});
