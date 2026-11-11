import { ServiceListItem } from "@/prisma/models";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import messages from "@/i18n/messages/pt-BR.json";
import ServiceRow from "./index";

vi.mock("next/link", () => ({
  default: ({ children, href, ...rest }: any) => <a href={href} {...rest}>{children}</a>,
}));
vi.mock("@/components/service/ServiceMetaModal", () => ({ default: () => null }));

const service = (extra: Partial<ServiceListItem> = {}): ServiceListItem => ({
  slug: "culto-1",
  title: "Culto de domingo",
  date: new Date(2026, 10, 15, 9, 30),
  worshipLeader: "Rafael",
  preacher: "Pr. Samuel",
  sermonTheme: "Descanso em Cristo",
  sermonReference: "Mt 11.28-30",
  startTime: "09:30",
  songCount: 5,
  songTitles: [],
  updatedAt: new Date(2026, 10, 9),
  ...extra,
});

function renderRow(s: ServiceListItem, badge?: string) {
  return render(
    <NextIntlClientProvider locale="pt-BR" messages={messages}>
      <ul>
        <ServiceRow service={s} badge={badge} />
      </ul>
    </NextIntlClientProvider>
  );
}

describe("ServiceRow", () => {
  it("o título leva à liturgia", () => {
    renderRow(service());
    expect(screen.getByRole("link", { name: "Culto de domingo" })).toHaveAttribute("href", "/services/culto-1");
  });

  it("sem título usa o texto padrão", () => {
    renderRow(service({ title: null }));
    expect(screen.getByRole("link", { name: "Liturgia sem título" })).toBeInTheDocument();
  });

  it("mostra dia da semana e número, sem o mês", () => {
    renderRow(service());
    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.queryByText(/nov/i)).not.toBeInTheDocument();
  });

  it("mostra dirigente, pregador(a), tema e texto juntos e o número de músicas", () => {
    renderRow(service());
    expect(screen.getByText("Rafael")).toBeInTheDocument();
    expect(screen.getByText("Pr. Samuel")).toBeInTheDocument();
    expect(screen.getByText("Descanso em Cristo · Mt 11.28-30")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("sem pregador(a), tema e músicas, não inventa texto (só marcadores escondidos)", () => {
    renderRow(service({ preacher: "", sermonTheme: null, sermonReference: null, songCount: 0 }));
    expect(screen.queryByText("Pr. Samuel")).not.toBeInTheDocument();
    expect(screen.getAllByText("—")).toHaveLength(3);
  });

  it("mostra o selo quando recebe um", () => {
    renderRow(service(), "Esta semana");
    expect(screen.getByText("Esta semana")).toBeInTheDocument();
  });

  it("tem o menu de ações sempre visível", () => {
    renderRow(service());
    expect(screen.getByRole("button", { name: "Mais ações" })).toBeInTheDocument();
  });
});
