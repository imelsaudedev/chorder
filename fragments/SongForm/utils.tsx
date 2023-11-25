import { Unit, UnitType } from "@/models/unit";

export function getNextLocalId(units: Unit[]) {
  if (units.length === 0) {
    return 1;
  }
  return Math.max(...units.map((unit) => unit.localId)) + 1;
}

export function updateTypeIndices(units: Unit[]) {
  const countPerUnitType = new Map<UnitType, number>();
  for (let unit of units) {
    const unitType = unit.type;
    const count = (countPerUnitType.get(unitType) || 0) + 1;
    countPerUnitType.set(unitType, count);
    unit.typeIdx = count;
  }
  return units;
}
