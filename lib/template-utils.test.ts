import { ClientServiceTemplate } from "@/prisma/models";
import { describe, expect, it } from "vitest";
import { buildSectionsFromTemplate, summarizeTemplate } from "./template-utils";

function template(items: unknown): ClientServiceTemplate {
  return { id: 1, name: "Culto Dominical", items } as ClientServiceTemplate;
}

describe("summarizeTemplate", () => {
  it("conta seções, itens, duração total e horário", () => {
    const t = template({
      defaultStartTime: "09:00",
      sections: [
        { type: "CULTO", label: "Culto", units: [{ type: "SONG", durationMin: 5 }, { type: "FALA", durationMin: 80 }] },
        { type: "POS_CULTO", label: "Pós", units: [{ type: "AVISOS" }] },
      ],
    });
    expect(summarizeTemplate(t)).toBe("2 seções · 3 itens · 1h25 · 09:00");
  });

  it("usa o singular e omite o que não existe", () => {
    const t = template({ sections: [{ type: "CULTO", label: "Culto", units: [{ type: "FALA" }] }] });
    expect(summarizeTemplate(t)).toBe("1 seção · 1 item");
  });

  it("template vazio", () => {
    expect(summarizeTemplate(template({ sections: [] }))).toBe("0 seções · 0 itens");
  });
});

describe("buildSectionsFromTemplate", () => {
  it("monta um culto só com o esqueleto: música vira espaço em branco", () => {
    const t = template({
      sections: [
        {
          type: "CULTO",
          label: "Culto",
          units: [
            // Template antigo, com o arranjo hidratado dentro: precisa ser ignorado.
            { type: "SONG", label: "Música de abertura", durationMin: 5, arrangement: { id: 9 } },
            { type: "FALA", label: "Boas-vindas", durationMin: 3 },
          ],
        },
      ],
    });
    const [section] = buildSectionsFromTemplate(t);
    expect(section.units).toHaveLength(2);
    const [song, fala] = section.units;
    expect(song.type).toBe("SONG");
    expect(song.arrangementId).toBeNull();
    expect(song.arrangement).toBeUndefined();
    expect(song.label).toBe("Música de abertura");
    expect(song.durationMin).toBe(5);
    expect(fala.label).toBe("Boas-vindas");
    expect(song.clientId).not.toBe(fala.clientId);
  });
});
