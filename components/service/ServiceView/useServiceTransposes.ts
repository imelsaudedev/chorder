import { readStorage, removeStorage, writeStorage } from "@/hooks/useLocalStorageState";
import { ClientServiceUnit } from "@/prisma/models";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Tom ajustado NESTE aparelho, para uma música de um culto. `base` é o tom que o culto tinha
 * quando a pessoa ajustou: se o grupo decidir outro tom depois, o ajuste local deixa de valer
 * (quem decide é o culto) em vez de esconder a decisão nova.
 */
type StoredTranspose = { value: number; base: number };

/** Mesmo critério do Modo Palco: o arranjo do culto é uma cópia por liturgia, então identifica a música naquele culto. */
export function transposeStorageKey(unit: ClientServiceUnit): string {
  const arrangement = unit.arrangement;
  return `culto-tom:${arrangement?.id ?? arrangement?.originalArrangementId ?? "sem-arranjo"}`;
}

export function cultoTranspose(unit: ClientServiceUnit): number {
  return unit.semitoneTranspose ?? 0;
}

export function resolveTranspose(base: number, stored: StoredTranspose | null | undefined): number {
  return stored && stored.base === base && Number.isFinite(stored.value) ? stored.value : base;
}

/**
 * Tom de cada música do culto: o do culto (decidido em grupo, vem do banco) ou o ajustado só neste
 * aparelho, que fica no localStorage e sobrevive a recarregar. Mudar aqui nunca altera o culto.
 *
 * É derivado (tom do culto + ajuste local), e não uma cópia inicial: o culto pode carregar depois
 * da montagem, e o ajuste só é lido do armazenamento após montar (igual no servidor).
 */
export function useServiceTransposes(songUnits: ClientServiceUnit[]) {
  const keys = songUnits.map(transposeStorageKey);
  const keysSignature = keys.join("|");
  const [overrides, setOverrides] = useState<Record<string, StoredTranspose>>({});

  useIsomorphicLayoutEffect(() => {
    const loaded: Record<string, StoredTranspose> = {};
    keys.forEach((key) => {
      const stored = readStorage<StoredTranspose | null>(key, null);
      if (stored && typeof stored.value === "number" && typeof stored.base === "number") loaded[key] = stored;
    });
    setOverrides(loaded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keysSignature]);

  const transposes = songUnits.map((unit, i) => resolveTranspose(cultoTranspose(unit), overrides[keys[i]]));
  const cultoTransposes = songUnits.map(cultoTranspose);

  // Sempre o valor da última renderização: quem chama (o SongConfigProvider avisa a cada
  // mudança, inclusive ao montar) pode estar com uma versão anterior.
  const current = useRef({ songUnits, keys, transposes });
  current.current = { songUnits, keys, transposes };

  const setTranspose = useCallback((index: number, value: number) => {
    const { songUnits: units, keys: ks, transposes: now } = current.current;
    const unit = units[index];
    if (!unit || now[index] === value) return; // sem mudança real (ex.: aviso de montagem): não mexe no armazenamento
    const key = ks[index];
    const base = cultoTranspose(unit);
    if (value === base) {
      removeStorage(key);
      setOverrides((prev) => {
        const { [key]: _removed, ...rest } = prev;
        return rest;
      });
    } else {
      const stored: StoredTranspose = { value, base };
      writeStorage(key, stored);
      setOverrides((prev) => ({ ...prev, [key]: stored }));
    }
  }, []);

  return { transposes, cultoTransposes, setTranspose };
}
