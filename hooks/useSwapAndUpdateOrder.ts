import { useCallback } from "react";

export function useSwapAndUpdateOrder<T extends { order: number }>(
  units: T[],
  setValue: (index: number, name: string, value: any) => void,
  swap: (index1: number, index2: number) => void
) {
  return useCallback(
    (fromIndex: number, toIndex: number) => {
      const fromUnit = units[fromIndex];
      const toUnit = units[toIndex];
      setValue(fromIndex, "order", toUnit.order);
      setValue(toIndex, "order", fromUnit.order);
      swap(fromIndex, toIndex);
    },
    [units, setValue, swap]
  );
}
