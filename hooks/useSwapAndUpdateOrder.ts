import { useCallback } from "react";

export function useSwapAndUpdateOrder<T extends { order: number }>(
  units: T[],
  setValue: (index: number, name: string, value: any) => void,
  swap: (index1: number, index2: number) => void
) {
  return useCallback(
    (fromIndex: number, toIndex: number) => {
      const fromUnitOrder = units[fromIndex].order;
      const toUnitOrder = units[toIndex].order;
      setValue(fromIndex, "order", toUnitOrder);
      setValue(toIndex, "order", fromUnitOrder);
      swap(fromIndex, toIndex);
    },
    [units, setValue, swap]
  );
}
