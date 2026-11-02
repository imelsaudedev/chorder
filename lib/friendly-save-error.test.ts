import { ClientService } from "@/prisma/models";
import { describe, expect, it } from "vitest";
import { friendlySaveError } from "./friendly-save-error";

const service = {
  units: [{ arrangement: { song: { title: "A Cada Momento" } } }],
  plan: {
    sections: [
      { label: "Culto", units: [{ type: "FALA", label: "Boas-vindas" }] },
    ],
  },
} as unknown as ClientService;

const raw = (issues: unknown[]) => JSON.stringify({ error: "invalid", issues });

describe("friendlySaveError", () => {
  it("aponta a música e o bloco vazio da cifra", () => {
    const msg = friendlySaveError(
      raw([{ path: ["units", 0, "arrangement", "units", 2, "content"], message: "String must contain at least 1 character(s)" }]),
      service
    );
    expect(msg).toBe('Na música "A Cada Momento": no bloco 3 da cifra, o conteúdo não pode ficar vazio.');
  });

  it("aponta o item do roteiro", () => {
    const msg = friendlySaveError(
      raw([{ path: ["plan", "sections", 0, "units", 0, "durationMin"], message: "Expected number, received string" }]),
      service
    );
    expect(msg).toBe('No item "Boas-vindas" da seção "Culto": a duração precisa ser um número.');
  });

  it("resume quando há muitos problemas e ignora repetidos", () => {
    const issue = { path: ["title"], message: "Required" };
    const msg = friendlySaveError(
      raw([issue, issue, { path: ["date"], message: "Invalid date" }, { path: ["preacher"], message: "Required" }, { path: ["worshipLeader"], message: "Required" }]),
      service
    );
    expect(msg).toContain("(e mais 2 problemas)");
  });

  it("devolve null para texto que não é validação", () => {
    expect(friendlySaveError("Invalid service data", service)).toBeNull();
  });
});
