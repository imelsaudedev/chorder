import { Button } from "@/components/ui/button";
import { transposeChord } from "@/chopro/music";
import { useSongConfig } from "@/components/config/SongConfig";
import { cn } from "@/lib/utils";
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";

// Par [sustenido, bemol] — ordem fixa no seletor
const ENHARMONIC_PAIRS: [string, string][] = [
  ["C#", "Db"],
  ["D#", "Eb"],
  ["F#", "Gb"],
  ["G#", "Ab"],
  ["A#", "Bb"],
];

function findPair(key: string): [string, string] | null {
  return ENHARMONIC_PAIRS.find(([s, f]) => s === key || f === key) ?? null;
}

type KeyButtonSetProps = {
  originalKey: string;
  transpose: number;
  setTranspose: Dispatch<SetStateAction<number>>;
  size?: "default" | "sm";
};

export default function KeyButtonSet({
  originalKey,
  transpose,
  setTranspose,
  size = "default",
}: KeyButtonSetProps) {
  const { setEnharmonicPreference } = useSongConfig();
  const [songKey, setSongKey] = useState(() => transposeChord(originalKey, originalKey, transpose));

  useEffect(() => {
    setSongKey(transposeChord(originalKey, originalKey, transpose));
    setEnharmonicPreference(null);
  }, [transpose, originalKey, setEnharmonicPreference]);

  const handleIncrease = useCallback(() => setTranspose((prev) => prev + 1), [setTranspose]);
  const handleDecrease = useCallback(() => setTranspose((prev) => prev - 1), [setTranspose]);

  const pair = findPair(songKey);

  const midH   = size === "sm" ? "h-8"  : "h-9";
  const midW   = size === "sm" ? "w-14" : "w-16";
  const midText = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className="flex flex-row">
      <Button
        type="button"
        variant="outline"
        size={size}
        className="rounded-l-md rounded-r-none"
        onClick={handleDecrease}
      >
        ♭
      </Button>

      {/* Slot central — largura fixa, não muda com enarmônico */}
      <div className={cn("border border-input flex items-stretch", midW, midH)}>
        {pair ? (
          <>
            {pair.map((key) => (
              <button
                key={key}
                type="button"
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => {
                  setSongKey(key);
                  setEnharmonicPreference(key === pair[0] ? "sharp" : "flat");
                }}
                className={cn(
                  "flex-1 flex items-center justify-center font-semibold transition-colors border-r last:border-r-0 border-input",
                  midText,
                  key === songKey
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {key}
              </button>
            ))}
          </>
        ) : (
          <span className={cn("flex-1 flex items-center justify-center select-none font-semibold", midText)}>
            {songKey}
          </span>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        size={size}
        className="rounded-r-md rounded-l-none"
        onClick={handleIncrease}
      >
        ♯
      </Button>
    </div>
  );
}
