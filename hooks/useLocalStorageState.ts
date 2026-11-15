import { Dispatch, SetStateAction, useEffect, useState } from "react";

export function readStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const stored = window.localStorage.getItem(key);
    return stored !== null ? (JSON.parse(stored) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function writeStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Armazenamento indisponível (ex. modo privado, cota excedida) — segue só em memória.
  }
}

/**
 * Estado persistido no localStorage do aparelho, sem sincronização entre
 * abas/dispositivos. Nunca lança erro se o armazenamento estiver
 * indisponível — nesse caso o estado segue funcionando só em memória.
 *
 * Trocar `key` (ex. ao mudar de música) recarrega o valor daquela chave
 * (ou `defaultValue`, se nunca salvo).
 */
export function useLocalStorageState<T>(
  key: string,
  defaultValue: T
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => readStorage(key, defaultValue));

  useEffect(() => {
    setValue(readStorage(key, defaultValue));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    writeStorage(key, value);
  }, [key, value]);

  return [value, setValue];
}
