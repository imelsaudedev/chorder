import { ArrangementUnit } from "@/modelsOLd/song";
import { Unit, UnitType } from "@/modelsOLd/unit";

export function updateTypeIndices(arrangementUnits: ArrangementUnit[]) {
  const UIDsPerUnitType = new Map<UnitType, string[]>();
  for (let arrangementUnit of arrangementUnits) {
    if (arrangementUnit.unit) {
      if (!arrangementUnit.unit.localUID) {
        throw new Error("Unit is missing localUID");
      }
      if (!UIDsPerUnitType.has(arrangementUnit.unit.type)) {
        UIDsPerUnitType.set(arrangementUnit.unit.type, []);
      }
      const uids = UIDsPerUnitType.get(arrangementUnit.unit.type) as string[];
      const uid = arrangementUnit.unit.localUID;
      let idx = uids.indexOf(uid);
      if (idx === -1) {
        uids.push(uid);
        idx = uids.length - 1;
      }
      arrangementUnit.unit.typeIdx = idx + 1;
    }
  }

  return arrangementUnits;
}

export function getUniqueUnits(arrangementUnits: ArrangementUnit[]) {
  const uniqueUnits = new Map<string, Unit>();
  for (let arrangementUnit of arrangementUnits) {
    if (arrangementUnit.unit) {
      if (!arrangementUnit.unit.localUID) {
        throw new Error("Unit is missing localUID");
      }
      uniqueUnits.set(arrangementUnit.unit.localUID, arrangementUnit.unit);
    }
  }
  return Array.from(uniqueUnits.values());
}
