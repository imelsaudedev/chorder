import { Dispatch, SetStateAction, useCallback } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components-old/ui/toggle-group";
import { useTranslations } from "next-intl";

export type Mode = "chords" | "lyrics" | "text";

type ModeButtonSetProps = {
  id?: string;
  mode: Mode;
  setMode: Dispatch<SetStateAction<Mode>>;
};

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
      <ToggleGroupItem value="chords" aria-label={t("chords")}>
        {t("chords")}
      </ToggleGroupItem>
      <ToggleGroupItem value="lyrics" aria-label={t("lyrics")}>
        {t("lyrics")}
      </ToggleGroupItem>
      <ToggleGroupItem value="text" aria-label={t("text")}>
        {t("text")}
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
