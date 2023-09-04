import messages from "@/i18n/messages";
import { Unit, UnitType } from "@/models/unit";

export function updateLocalIds(units: Unit[]) {
  const countPerUnitType = new Map<UnitType, number>();
  for (let unit of units) {
    const unitType = unit.type;
    const count = (countPerUnitType.get(unitType) || 0) + 1;
    countPerUnitType.set(unitType, count);
    unit.localId = `${messages.unitTypes[unitType]}--${count}`;
  }
  return units;
}
