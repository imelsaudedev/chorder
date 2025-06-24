import Heading from "@/components/common/Heading";
import CloseIcon from "@/components-old/icons/CloseIcon";
import { Button } from "@/components-old/ui/button";
import { Label } from "@/components-old/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components-old/ui/select";
import { Switch } from "@/components-old/ui/switch";
import {
  ServiceFormSchema,
  SongUnitSchema,
} from "@/app-old/(main)/services/ServiceForm/schema";
import { useTranslations } from "next-intl";
import { MouseEventHandler, useCallback, useMemo } from "react";
import { useFormContext } from "react-hook-form";

type ServiceSongUnitEditorHeaderProps = {
  index: number;
  onRemoveUnit: () => void;
  onToggleEdit: () => void;
  isEditing: boolean;
};

export default function ServiceSongUnitEditorHeader({
  index,
  onRemoveUnit,
  onToggleEdit,
  isEditing,
}: ServiceSongUnitEditorHeaderProps) {
  const t = useTranslations("SongData");
  const { setValue, getValues } = useFormContext<ServiceFormSchema>();
  const unit = getValues(`units.${index}`) as SongUnitSchema;

  const transpositionKeys = useMemo(() => {
    const baseKey = unit.arrangement.key || "C";
    const keys = [
      "C",
      "C#",
      "D",
      "D#",
      "E",
      "F",
      "F#",
      "G",
      "G#",
      "A",
      "A#",
      "B",
    ];
    const baseKeyIndex = keys.indexOf(baseKey);
    return keys.map((key, index) => [key, index - baseKeyIndex] as const);
  }, [unit.arrangement.key]);

  const handleSemitoneTransposeChange = useCallback(
    (semitoneString: string) =>
      setValue(`units.${index}.semitoneTranspose`, parseInt(semitoneString)),
    [index, setValue]
  );

  const handleRemoveUnit: MouseEventHandler = useCallback(
    (event) => {
      event.preventDefault();
      onRemoveUnit();
    },
    [onRemoveUnit]
  );

  return (
    <div className="flex w-full flex-row justify-between items-start gap-4">
      {/* Coluna 1: Agrupa título, artista, switch e tom */}
      <div className="flex flex-col md:flex-row md:items-center flex-1 gap-2">
        {/* Título e artista */}
        <div className="flex flex-col md:flex-1">
          <Heading level={3}>{unit.arrangement.title}</Heading>
          {unit.arrangement.artist && (
            <span className="text-xs sm:text-sm text-zinc-600">
              {unit.arrangement.artist}
            </span>
          )}
        </div>

        {/* Controles de edição e transposição */}
        <div className="flex flex-row items-center gap-4 md:justify-end">
          {/* Switch de edição */}
          <div className="flex items-center gap-2">
            <Switch
              id={`edit-switch-${index}`}
              checked={isEditing}
              onCheckedChange={onToggleEdit}
            />
            <Label
              htmlFor={`edit-switch-${index}`}
              className="text-xs sm:text-sm"
            >
              {t("editSong")}
            </Label>
          </div>

          {/* Seleção de tom */}
          <div className="flex items-center gap-2">
            <Label className="hidden sm:block text-sm">{t("key")}</Label>
            <Select
              defaultValue={unit.semitoneTranspose.toString()}
              onValueChange={handleSemitoneTransposeChange}
            >
              <SelectTrigger className="w-16">
                <SelectValue placeholder={t("keyPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {transpositionKeys.map(([key, semitones]) => (
                  <SelectItem
                    key={`transpose--${key}`}
                    value={semitones.toString()}
                  >
                    {key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Coluna 2: Botão de Fechar */}
      <div>
        <Button onClick={handleRemoveUnit} variant="ghost" size="icon">
          <CloseIcon />
        </Button>
      </div>
    </div>
  );
}
