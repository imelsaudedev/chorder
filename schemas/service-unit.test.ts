import { describe, expect, it } from "vitest";
import { serviceUnitSchema } from "./service-unit";

const baseArrangement = {
  name: null,
  originalArrangementId: 1,
  key: "G",
  youtubeUrl: null,
  audios: [],
  isDefault: false,
  isDeleted: false,
  isServiceArrangement: true,
};
const block = { type: "VERSE" as const, order: 1, notes: null, repeatCount: 1 };
const baseUnit = {
  clientId: "c1",
  type: "SONG" as const,
  semitoneTranspose: null,
  arrangementId: 1,
  order: 1,
};

describe("serviceUnitSchema — arranjo embutido", () => {
  it("aceita blocos com conteúdo vazio (arranjos antigos já salvos)", () => {
    const result = serviceUnitSchema.safeParse({
      ...baseUnit,
      arrangement: { ...baseArrangement, units: [{ ...block, content: "" }] },
    });
    expect(result.success).toBe(true);
  });
});
