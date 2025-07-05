import { useCallback } from "react";

export function useSwapAndUpdateOrder<T extends { order: number }>(
  units: T[],
  update: (index: number, unit: T) => void,
  swap: (index1: number, index2: number) => void
) {
  return useCallback(
    (fromIndex: number, toIndex: number) => {
      const fromUnit = units[fromIndex];
      const toUnit = units[toIndex];
      update(fromIndex, {
        ...fromUnit,
        order: toUnit.order,
      });
      update(toIndex, {
        ...toUnit,
        order: fromUnit.order,
      });
      swap(fromIndex, toIndex);
    },
    [units, update, swap]
  );
}
