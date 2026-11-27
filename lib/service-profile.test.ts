import { describe, expect, it } from "vitest";
import { SERVICE_PROFILES, serviceProfile } from "./service-profile";

describe("serviceProfile", () => {
  it("sem escopo vale o da igreja", () => {
    expect(serviceProfile(undefined)).toBe(SERVICE_PROFILES.CHURCH);
    expect(serviceProfile(null)).toBe(SERVICE_PROFILES.CHURCH);
  });

  it("igreja: título obrigatório, modelos, pregador e dirigente", () => {
    const p = serviceProfile("CHURCH");
    expect(p).toMatchObject({ titleRequired: true, showTemplates: true, showPreacher: true, leader: "dirigente" });
    expect(p.itemTypes).toHaveLength(7);
    expect(p.defaultSection).toEqual({ type: "CULTO", label: "Culto" });
    expect(p.chooseSectionType).toBe(true);
  });

  it("pessoal: título opcional, sem modelos nem pregador, quem conduz", () => {
    const p = serviceProfile("PERSONAL");
    expect(p).toMatchObject({
      titleRequired: false,
      suggestTitle: false,
      showTemplates: false,
      showPreacher: false,
      leader: "conduz",
      chooseSectionType: false,
      toastOnSave: true,
    });
    expect(p.itemTypes).toEqual(["SONG", "LEITURA", "ORACAO", "FALA", "OUTRO"]);
    expect(p.itemTypes).not.toContain("AVISOS");
    expect(p.itemTypes).not.toContain("SERMAO");
    expect(p.defaultSection).toEqual({ type: "ESPECIAL", label: "Roteiro" });
  });
});
