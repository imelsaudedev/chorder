"use client";

import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import IncreaseDecreaseButtonSet from "../IncreaseDecreaseButtonSet";
import {
  SongKey,
  harmonicIndex,
  toHalfToneIndex,
  transposeChord,
} from "@/chopro/music";

type KeyButtonSetProps = {
  originalKey: string;
  transpose: number;
  setTranspose: Dispatch<SetStateAction<number>>;
};

export default function KeyButtonSet({
  originalKey,
  transpose,
  setTranspose,
}: KeyButtonSetProps) {
  const [songKey, setSongKey] = useState<string>(originalKey);
  useEffect(() => {
    setSongKey(transposeChord(originalKey, originalKey, transpose));
  }, [transpose, originalKey]);

  const handleIncrease = useCallback(() => {
    setTranspose((prev) => prev + 1);
  }, [setTranspose]);

  const handleDecrease = useCallback(() => {
    setTranspose((prev) => prev - 1);
  }, [setTranspose]);

  const handleChangeSongKey = useCallback(
    (key: string) => {
      setSongKey(key);
      setTranspose(
        toHalfToneIndex(
          harmonicIndex(key as SongKey) - harmonicIndex(originalKey as SongKey)
        )
      );
    },
    [setTranspose, originalKey]
  );

  return (
    <IncreaseDecreaseButtonSet
      stringValue={songKey}
      setStringValue={handleChangeSongKey}
      increase={handleIncrease}
      decrease={handleDecrease}
      decreaseLabel="♭"
      increaseLabel="♯"
    />
  );
}
