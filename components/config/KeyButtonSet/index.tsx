import { useSongConfig } from "@/components/config/SongConfig";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import {
  Accidental,
  currentRoot,
  formatKey,
  isAccidentalAllowed,
  isSameShift,
  NATURAL_NOTES,
  NaturalNote,
  shiftToRoot,
} from "./key-utils";

type KeyButtonSetProps = {
  originalKey: string;
  transpose: number;
  setTranspose: Dispatch<SetStateAction<number>>;
  size?: "default" | "sm";
};

/**
 * Seletor de tom: uma linha com as sete notas (tocar = tom natural) e outra com ♭ e ♯ (tocar liga o
 * acidente sobre a nota escolhida; tocar de novo desliga). Escolhe a raiz do tom: o sufixo do tom
 * original (m, 9…) é mantido. O resultado vira um deslocamento em semitons sobre o tom original, que
 * é o que o resto do sistema guarda e usa.
 */
export default function KeyButtonSet({ originalKey, transpose, setTranspose, size = "default" }: KeyButtonSetProps) {
  const { enharmonicPreference, setEnharmonicPreference } = useSongConfig();

  // Trocar o tom por outro caminho (ex.: "Voltar ao do culto") limpa a preferência de grafia; as trocas
  // feitas aqui já definem a sua. Sem este marcador, o efeito apagaria a preferência recém-escolhida.
  const ownChange = useRef(false);
  useEffect(() => {
    if (ownChange.current) {
      ownChange.current = false;
      return;
    }
    setEnharmonicPreference(null);
  }, [transpose, originalKey, setEnharmonicPreference]);

  const root = currentRoot(originalKey, transpose, enharmonicPreference);
  if (!root) return null;

  function choose(letter: NaturalNote, accidental: Accidental) {
    const shift = shiftToRoot(originalKey, letter, accidental);
    if (shift === null) return;
    const preference = accidental === "#" ? "sharp" : accidental === "b" ? "flat" : null;
    // Mesmo tom (ex.: só mudou a grafia, C♯ → D♭): mantém o deslocamento que já existe.
    if (!isSameShift(shift, transpose)) {
      ownChange.current = true;
      setTranspose(shift);
    }
    setEnharmonicPreference(preference);
  }

  const buttonSize = size === "sm" ? "sm" : "default";
  const cell = size === "sm" ? "h-8 text-xs" : "h-9 text-sm";

  return (
    <div className="flex flex-col gap-2">
      <div role="group" aria-label="Nota do tom" className="flex">
        {NATURAL_NOTES.map((letter) => {
          const highlighted = root.letter === letter;
          return (
            <Button
              key={letter}
              type="button"
              variant={highlighted ? "default" : "outline"}
              size={buttonSize}
              aria-pressed={highlighted}
              aria-label={`Nota ${letter}`}
              onClick={() => choose(letter, "")}
              className={cn(
                "min-w-9 flex-1 rounded-none px-0 font-semibold first:rounded-l-md last:rounded-r-md [&:not(:first-child)]:-ml-px",
                cell
              )}
            >
              {letter}
            </Button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <div role="group" aria-label="Acidente" className="flex">
          {([
            { accidental: "b", glyph: "♭", label: "Bemol" },
            { accidental: "#", glyph: "♯", label: "Sustenido" },
          ] as const).map(({ accidental, glyph, label }, i) => {
            const active = root.accidental === accidental;
            return (
              <Button
                key={accidental}
                type="button"
                variant={active ? "default" : "outline"}
                size={buttonSize}
                aria-pressed={active}
                aria-label={label}
                disabled={!active && !isAccidentalAllowed(root.letter, accidental)}
                onClick={() => choose(root.letter, active ? "" : accidental)}
                className={cn("w-11 px-0 text-base font-semibold", i === 0 ? "rounded-r-none" : "-ml-px rounded-l-none", cell)}
              >
                {glyph}
              </Button>
            );
          })}
        </div>
        {/* O tom atual já aparece no botão que abre o seletor: aqui só para leitor de tela. */}
        <span className="sr-only" aria-live="polite" data-testid="key-readout">
          {formatKey(root)}
        </span>
      </div>
    </div>
  );
}
