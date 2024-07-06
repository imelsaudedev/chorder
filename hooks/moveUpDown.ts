import { useCallback } from 'react';

type SwapFunction = (index1: number, index2: number) => void;

export function useMoveUnitDown(swapElements: SwapFunction, maxIndex: number) {
  return useCallback(
    (index: number) => {
      if (index === maxIndex) return;
      swapElements(index, index + 1);
    },
    [maxIndex, swapElements]
  );
}

export function useMoveUnitUp(swapElements: SwapFunction) {
  return useCallback(
    (index: number) => {
      if (index === 0) return;
      swapElements(index, index - 1);
    },
    [swapElements]
  );
}
