import { RequiredArrangement, SongWith } from "@/models/song";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import useUpdateParams from "@/hooks/useUpdateParams";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";

type ArrangementSelectorProps = {
  song: SongWith<RequiredArrangement>;
};

export default function ArrangementSelector({
  song,
}: ArrangementSelectorProps) {
  const t = useTranslations("Messages");

  const updateParams = useUpdateParams();

  const arrangementOptions = useMemo(() => {
    return song.arrangements.map((arrangement, idx) => ({
      label:
        arrangement.name ||
        (arrangement.isDefault
          ? t("defaultArrangement")
          : `${t("arrangement")} ${idx + 1}`),
      value: `${idx}`,
    }));
  }, [song.arrangements, t]);
  const handleChangeArrangement = (arrangementIdxStr: string) => {
    const arrangementIdx = parseInt(arrangementIdxStr);
    if (arrangementIdx !== song.currentArrangementId) {
      updateParams("arr", `${arrangementIdx}`);
    }
  };

  return (
    <Select
      value={`${song.currentArrangementId}`}
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
