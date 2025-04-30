import { useFetchSongArrangements } from "@/app/api/api-client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

type ArrangementSelectorProps = {
  songSlug: string;
  initialArrangementId: number | undefined;
  onArrangementChange: (arrangementId: number) => void;
};

export default function ArrangementSelector({
  songSlug,
  initialArrangementId,
  onArrangementChange,
}: ArrangementSelectorProps) {
  const t = useTranslations("Messages");

  const { arrangements } = useFetchSongArrangements(songSlug, false);
  const arrangementsWithIndex = useMemo(() => {
    return arrangements?.map((arrangement, index) => ({
      ...arrangement,
      index,
    }));
  }, [arrangements]);

  const arrangementOptions = useMemo(() => {
    return arrangementsWithIndex?.map((arrangement) => ({
      label:
        arrangement.name ||
        (arrangement.isDefault
          ? t("defaultArrangement")
          : `${t("arrangement")} ${arrangement.index + 1}`),
      value: `${arrangement.id}`,
    }));
  }, [arrangementsWithIndex, t]);

  const handleChangeArrangement = (value: string) => {
    onArrangementChange(parseInt(value));
  };

  if (!arrangements?.length || !arrangementOptions?.length) {
    return null;
  }

  const defaultArrangement = arrangements.find(
    (arrangement) => arrangement.isDefault
  );

  return (
    <Select
      value={`${initialArrangementId ?? defaultArrangement?.id}`}
      onValueChange={handleChangeArrangement}
      disabled={arrangementOptions.length <= 1}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={t("arrangement")} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {arrangementOptions.map((option) => (
            <SelectItem key={`option--${option.value}`} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
