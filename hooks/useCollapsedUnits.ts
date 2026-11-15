import { useCallback, useEffect, useMemo, useState } from "react";
import { readStorage, writeStorage } from "./useLocalStorageState";

/**
 * Blocos minimizados de uma cifra ("esse eu já sei tocar": só o cabeçalho
 * fica). Guardado no aparelho, por arranjo, pela posição do bloco — assim a
 * escolha vale na tela normal e no Modo Palco, e sobrevive a recarregar a
 * página. Posição, não id, porque os blocos só têm id depois de salvos; se a
 * cifra for editada e os blocos mudarem de lugar, o mínimo que pode acontecer
 * é um bloco diferente aparecer minimizado (e voltar com um toque).
 *
 * Começa vazio e só lê o armazenamento depois de montar: a tela do catálogo
 * também renderiza no servidor, e ler antes causaria divergência de hidratação.
 */
export function useCollapsedUnits(
  arrangementId: number | null | undefined
): [ReadonlySet<number>, (index: number) => void] {
  const key = `collapsed-units:${arrangementId ?? "none"}`;
  const [list, setList] = useState<number[]>([]);

  useEffect(() => {
    setList(readStorage<number[]>(key, []));
  }, [key]);

  const collapsed = useMemo(() => new Set(list), [list]);
  const toggle = useCallback(
    (index: number) => {
      const next = list.includes(index) ? list.filter((value) => value !== index) : [...list, index];
      setList(next);
      writeStorage(key, next);
    },
    [list, key]
  );
  return [collapsed, toggle];
}
