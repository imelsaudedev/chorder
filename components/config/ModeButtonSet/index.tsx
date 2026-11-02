import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useTranslations } from "next-intl";
import { Dispatch, SetStateAction, useCallback } from "react";
import { Mode } from "../config";

type ModeButtonSetProps = {
  id?: string;
  mode: Mode;
  setMode: Dispatch<SetStateAction<Mode>>;
};

const MODES: Mode[] = ["chords", "lyrics", "conventions", "text"];

// O ToggleGroupItem do sistema é `flex-1 shrink-0` e o grupo é `w-fit`: a largura do grupo é a
// soma dos textos, mas o flex-1 a reparte em partes IGUAIS — e um rótulo mais longo ("Convenções")
// passa da sua parte e estoura o botão. `flex-none`: cada botão com a largura do próprio texto.
const ITEM_CLASS = "flex-none";

export default function ModeButtonSet({
  id,
  mode,
  setMode,
}: ModeButtonSetProps) {
  const t = useTranslations("Modes");
  const handleValueChange = useCallback(
    (value: string) => {
      setMode(value as Mode);
    },
    [setMode]
  );

  return (
    <ToggleGroup
      id={id}
      type="single"
      onValueChange={handleValueChange}
      value={mode}
      variant="outline"
    >
      {MODES.map((value) => (
        <ToggleGroupItem key={value} value={value} aria-label={t(value)} className={ITEM_CLASS}>
          {t(value)}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
