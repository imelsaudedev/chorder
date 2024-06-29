import { useCallback } from 'react';

export default function useMoveUpDownCallbacks<T>(list: T[], setList: (newList: T[]) => void) {
  const moveElementUp = useMoveUpCallback(list, setList);
  const moveElementDown = useMoveDownCallback(list, setList);
  return [moveElementUp, moveElementDown];
}

function useMoveUpCallback<T>(list: T[], setList: (newList: T[]) => void) {
  return useCallback(
    (index: number) => {
      if (index <= 0 || index >= list.length) return;
      const newList = [...list];
      const temp = newList[index - 1];
      newList[index - 1] = newList[index];
      newList[index] = temp;
      setList(newList);
    },
    [list, setList]
  );
}

function useMoveDownCallback<T>(list: T[], setList: (newList: T[]) => void) {
  return useCallback(
    (index: number) => {
      if (index < 0 || index >= list.length - 1) return;
      const newList = [...list];
      const temp = newList[index + 1];
      newList[index + 1] = newList[index];
      newList[index] = temp;
      setList(newList);
    },
    [list, setList]
  );
}
