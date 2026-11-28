import type { ServicePlan } from "@/prisma/models";
import { describe, expect, it } from "vitest";
import { summarizeSermons } from "./sermon-summary";

const unit = (order: number, type: string, label: string | null, metadata: object | null = null) =>
  ({ clientId: `u${order}`, type, order, label, metadata }) as never;

const plan = (...units: ReturnType<typeof unit>[]): ServicePlan => ({
  startTime: "10:00",
  sections: [{ id: "s", type: "CULTO", label: "Culto", order: 1, units }],
});

describe("summarizeSermons", () => {
  it("lê pregador, tema e texto do item Sermão", () => {
    const s = summarizeSermons(
      plan(unit(1, "SONG", null), unit(2, "SERMAO", "A graça", { preacher: "Hugo Lima", reference: "Jo 3.16" }))
    );
    expect(s).toEqual({ preacher: "Hugo Lima", theme: "A graça", reference: "Jo 3.16" });
  });

  it("culto sem sermão (só canções) não tem pregador", () => {
    expect(summarizeSermons(plan(unit(1, "SONG", null)))).toEqual({ preacher: null, theme: null, reference: null });
    expect(summarizeSermons(null)).toEqual({ preacher: null, theme: null, reference: null });
  });

  it("dois sermões: pregadores juntos, sem repetir; tema e texto do primeiro que tiver", () => {
    const s = summarizeSermons(
      plan(
        unit(1, "SERMAO", null, { preacher: "Ana Souza" }),
        unit(2, "SERMAO", "Segundo tema", { preacher: "Hugo Lima", reference: "Rm 8" }),
        unit(3, "SERMAO", "Terceiro", { preacher: "ana souza" })
      )
    );
    expect(s).toEqual({ preacher: "Ana Souza e Hugo Lima", theme: "Segundo tema", reference: "Rm 8" });
  });

  it("modelo, com sermão em branco, não inventa pregador", () => {
    expect(summarizeSermons(plan(unit(1, "SERMAO", null, { preacher: "  " })))).toEqual({
      preacher: null,
      theme: null,
      reference: null,
    });
  });

  it("respeita a ordem das seções e dos itens, não a do array", () => {
    const p: ServicePlan = {
      startTime: null,
      sections: [
        { id: "b", type: "CULTO", label: "B", order: 2, units: [unit(1, "SERMAO", "Depois", { preacher: "B" })] },
        { id: "a", type: "CULTO", label: "A", order: 1, units: [unit(1, "SERMAO", "Antes", { preacher: "A" })] },
      ],
    };
    expect(summarizeSermons(p)).toEqual({ preacher: "A e B", theme: "Antes", reference: null });
  });
});
