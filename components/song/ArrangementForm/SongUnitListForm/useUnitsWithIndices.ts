import { ClientSongUnit } from "@/prisma/models";
import { useMemo } from "react";

export default function useUnitsWithIndices(units: ClientSongUnit[]) {
  return useMemo(() => {
    const typeIndices: Record<string, number> = {};
    return units?.map((unit) => {
      if (!typeIndices[unit.type]) {
        typeIndices[unit.type] = 0;
      }
      typeIndices[unit.type]++;
      return {
        ...unit,
        typeIndex: typeIndices[unit.type],
      };
    });
  }, [units]);
}
