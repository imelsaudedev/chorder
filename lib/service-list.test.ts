import { describe, expect, it } from "vitest";
import type { ServicePlan } from "@/prisma/models";
import { summarizeServicePlan } from "./service-list";

const unit = (order: number, type: "SONG" | "ORACAO", arrangementId: number | null) =>
  ({ clientId: `u${order}`, type, arrangementId, semitoneTranspose: 0, order }) as ServicePlan["sections"][number]["units"][number];

describe("summarizeServicePlan", () => {
  it("sem plano: zero músicas e sem horário", () => {
    expect(summarizeServicePlan(null)).toEqual({ startTime: null, songCount: 0, arrangementIds: [] });
  });

  it("conta só músicas e guarda os arranjos na ordem da liturgia", () => {
    const plan: ServicePlan = {
      startTime: "09:30",
      sections: [
        { id: "b", type: "CULTO", label: "Culto", order: 2, units: [unit(2, "SONG", 30), unit(1, "SONG", 20)] },
        { id: "a", type: "PRE_CULTO", label: "Pré", order: 1, units: [unit(1, "SONG", 10), unit(2, "ORACAO", null)] },
      ],
    };
    expect(summarizeServicePlan(plan)).toEqual({ startTime: "09:30", songCount: 3, arrangementIds: [10, 20, 30] });
  });

  it("música sem arranjo conta, mas não entra na lista de arranjos; repetida não duplica", () => {
    const plan: ServicePlan = {
      startTime: null,
      sections: [{ id: "a", type: "CULTO", label: "Culto", order: 1, units: [unit(1, "SONG", null), unit(2, "SONG", 5), unit(3, "SONG", 5)] }],
    };
    expect(summarizeServicePlan(plan)).toEqual({ startTime: null, songCount: 3, arrangementIds: [5] });
  });
});
