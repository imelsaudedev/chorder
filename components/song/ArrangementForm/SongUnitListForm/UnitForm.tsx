import { parseChordPro } from "@/chopro/music";
import TextInput from "@/components/common/TextInput";
import BadgeSelector from "@/components/song/BadgeSelector";
import ChordProViewer from "@/components/song/ChordProViewer";
import { unitColorClasses } from "@/components/song/unit-colors";
import { Button } from "@/components/ui/button";
import { ClientSongUnit, SongUnitType } from "@/prisma/models";
import { CopyIcon, TrashIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { ChangeEvent, useCallback, useId, useMemo } from "react";

type UnitFormProps = {
  unit: ClientSongUnit;
  removeUnit: () => void;
  duplicateUnit: () => void;
  onChangeUnit: (unit: ClientSongUnit) => void;
  className?: string;
};

export default function UnitForm({
  unit,
  removeUnit,
  duplicateUnit,
  onChangeUnit,
  className,
}: UnitFormProps) {
  const t = useTranslations();

  const colorClasses = unitColorClasses[unit.type];
  const contentId = useId();

  const handleRemoveUnit = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      removeUnit();
    },
    [removeUnit]
  );

  const handleDuplicateUnit = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      duplicateUnit();
    },
    [duplicateUnit]
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

      <div className="flex justify-end items-center mt-4 gap-2">
        <Button onClick={handleRemoveUnit} variant="ghost">
          <TrashIcon /> {t("Messages.delete")}
        </Button>
        <Button onClick={handleDuplicateUnit} variant="outline">
          <CopyIcon /> {t("Messages.duplicate")}
        </Button>
      </div>
    </div>
  );
}
