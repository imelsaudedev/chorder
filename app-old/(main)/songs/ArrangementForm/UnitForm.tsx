import { parseChordPro } from "@/app-old/lib/chopro/music";
import BadgeSelector from "@/app-old/lib/components/Badges/BadgeSelector";
import ChordProViewer from "@/app-old/lib/components/ChordProViewer";
import TextInput from "@/app-old/lib/components/TextInput";
import CloseIcon from "@/app-old/lib/components/icons/CloseIcon";
import { Button } from "@/components-old/ui/button";
import { unitTypeColorClasses } from "@/app-old/lib/components/unit-colors";
import { ClientSongUnit, SongUnitType } from "@/prisma/models";
import { useTranslations } from "next-intl";
import { ChangeEvent, useCallback, useId, useMemo } from "react";

type UnitFormProps = {
  unit: ClientSongUnit;
  removeUnit: () => void;
  onChangeUnit: (unit: ClientSongUnit) => void;
  className?: string;
};

export default function UnitForm({
  unit,
  removeUnit,
  onChangeUnit,
  className,
}: UnitFormProps) {
  const t = useTranslations();

  const colorClasses = unitTypeColorClasses[unit.type];
  const contentId = useId();

  const handleRemoveUnit = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      removeUnit();
    },
    [removeUnit]
  );

  const handleChangeUnitType = useCallback(
    (newValue: string) => {
      onChangeUnit({ ...unit, type: newValue as SongUnitType });
    },
    [onChangeUnit, unit]
  );

  const handleChangeChordpro = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      onChangeUnit({ ...unit, content: event.target.value });
    },
    [onChangeUnit, unit]
  );

  // Verifica se o conteúdo do ChordPro é válido
  const { hasError } = useMemo(() => {
    try {
      parseChordPro(unit.content);
      return { hasError: false };
    } catch {
      return { hasError: true };
    }
  }, [unit.content]);

  return (
    <div
      className={`border ${colorClasses.border} ${
        colorClasses.background
      } rounded-lg p-2 md:p-4 mb-2 ${className || ""}`}
    >
      <div className="flex justify-between items-center">
        <Button onClick={handleRemoveUnit} variant="ghost" size="icon">
          <CloseIcon />
        </Button>
      </div>

      <div className="mt-2">
        <BadgeSelector value={unit.type} onChange={handleChangeUnitType} />
      </div>

      <div className="flex flex-col md:grid md:grid-cols-2 gap-4 mt-4">
        <div className="flex flex-col">
          <TextInput
            id={contentId}
            className="resize-none grow bg-white font-mono"
            placeholder={t("UnitData.contentPlaceholder")}
            onChange={handleChangeChordpro}
            value={unit.content}
            minRows={1}
            long
          />
        </div>

        <div className="rounded-md bg-black/5 px-2 py-2">
          {hasError ? (
            <p className="text-red-500 text-sm">
              {t("Messages.invalidChordPro")}
            </p>
          ) : (
            <ChordProViewer chordpro={unit.content} density="compact" />
          )}
        </div>
      </div>
    </div>
  );
}
