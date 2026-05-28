import Heading from "@/components/common/Heading";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ClientServiceUnit, ClientSong } from "@/prisma/models";
import { ServiceUnitSchema } from "@/schemas/service-unit";
import { XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { MouseEventHandler, useCallback, useMemo } from "react";

type FormHeaderProps = {
  index: number;
  unit: ServiceUnitSchema;
  onChangeUnit: (unit: ServiceUnitSchema) => void;
  onRemoveUnit: () => void;
  onToggleEdit: () => void;
  isEditing: boolean;
};

export default function FormHeader({
  index,
  unit,
  onChangeUnit,
  onRemoveUnit,
  onToggleEdit,
  isEditing,
}: FormHeaderProps) {
  const t = useTranslations("SongData");

  const handleSemitoneTransposeChange = useCallback(
    (semitoneString: string) =>
      onChangeUnit({
        ...unit,
        semitoneTranspose: parseInt(semitoneString),
      }),
    [unit, onChangeUnit]
  );

  const handleRemoveUnit: MouseEventHandler = useCallback(
    (event) => {
      event.preventDefault();
      onRemoveUnit();
    },
    [onRemoveUnit]
  );

  if (!unit.arrangement || unit.type !== "SONG" || !unit.arrangement.song) {
    throw new Error("Invalid unit type or missing arrangement");
  }

  return (
    <div className="flex w-full flex-row justify-between items-start gap-4">
      {/* Column 1: Group title, artist, switch and tone */}
      <div className="flex flex-col md:flex-row md:items-center flex-1 gap-2">
        <TitleAndArtist song={unit.arrangement.song} />

        <div className="flex flex-row items-center gap-4 md:justify-end">
          {unit.arrangement.originalArrangementId && (
            <a
              target="_blank"
              className="text-xs sm:text-sm underline"
              href={`/songs/${unit.arrangement.song.id}/edit?arrangement=${unit.arrangement.originalArrangementId}`}
              rel="noopener noreferrer"
            >
              {t("editOriginal")}
            </a>
          )}
          <ToggleEdit
            id={`${index}-${unit.arrangement.song.id}`}
            isEditing={isEditing}
            onToggleEdit={onToggleEdit}
          />
          <ToneSelect
            unit={unit}
            handleSemitoneTransposeChange={handleSemitoneTransposeChange}
          />
        </div>
      </div>

      {/* Column 2: Close button */}
      <div>
        <Button onClick={handleRemoveUnit} variant="ghost" size="icon">
          <XIcon />
        </Button>
      </div>
    </div>
  );
}

type TitleAndArtistProps = {
  song: ClientSong;
};

function TitleAndArtist({ song }: TitleAndArtistProps) {
  return (
    <div className="flex flex-col md:flex-1">
      <Heading level={3}>{song.title}</Heading>
      {song.artist && (
        <span className="text-xs sm:text-sm text-zinc-600">{song.artist}</span>
      )}
    </div>
  );
}

type ToggleEditProps = {
  id: string;
  isEditing: boolean;
  onToggleEdit: () => void;
};

function ToggleEdit({ id, isEditing, onToggleEdit }: ToggleEditProps) {
  const t = useTranslations("SongData");

  return (
    <div className="flex items-center gap-2">
      <Switch
        id={`edit-switch-${id}`}
        checked={isEditing}
        onCheckedChange={onToggleEdit}
      />
      <Label htmlFor={`edit-switch-${id}`} className="text-xs sm:text-sm">
        {t("editSong")}
      </Label>
    </div>
  );
}

type ToneSelectProps = {
  unit: ClientServiceUnit;
  handleSemitoneTransposeChange: (semitoneString: string) => void;
};

function ToneSelect({ unit, handleSemitoneTransposeChange }: ToneSelectProps) {
  const t = useTranslations("SongData");
  const transpositionKeys = useTranspositionKeys(unit);

  return (
    <div className="flex items-center gap-2">
      <Label className="hidden sm:block text-sm">{t("key")}</Label>
      <Select
        defaultValue={(unit.semitoneTranspose ?? 0).toString()}
        onValueChange={handleSemitoneTransposeChange}
      >
        <SelectTrigger className="w-16">
          <SelectValue placeholder={t("keyPlaceholder")} />
        </SelectTrigger>
        <SelectContent>
          {transpositionKeys.map(([key, semitones]) => (
            <SelectItem key={`transpose--${key}`} value={semitones.toString()}>
              {key}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function useTranspositionKeys(unit: ClientServiceUnit) {
  return useMemo(() => {
    // TODO: Move this to a more appropriate place, and use it in the other places where we need transposition keys
    const baseKey = unit.arrangement?.key || "C";
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
  }, [unit.arrangement?.key]);
}
