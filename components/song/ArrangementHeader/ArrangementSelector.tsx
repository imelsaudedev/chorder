import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClientArrangement } from "@/prisma/models";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

type ArrangementSelectorProps = {
  arrangements: ClientArrangement[];
  currentArrangementId: number | undefined;
};

export default function ArrangementSelector({
  arrangements,
  currentArrangementId,
}: ArrangementSelectorProps) {
  const t = useTranslations("Messages");
  const arrangementOptions = useArrangementOptions(arrangements);
  const handleArrangementChange = useHandleArrangementChange();

  if (!arrangementOptions.length) {
    return <p className="text-red">Error: empty arrangement list</p>;
  }

  const defaultArrangement = arrangements.find(
    (arrangement) => arrangement.isDefault
  );

  return (
    <Select
      value={`${currentArrangementId ?? defaultArrangement?.id}`}
      onValueChange={handleArrangementChange}
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

function useHandleArrangementChange() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const handleChangeArrangement = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("arrangement", value);
    router.replace(`${pathname}?${params.toString()}`);
  };
  return handleChangeArrangement;
}

function useArrangementOptions(arrangements: ClientArrangement[]) {
  const t = useTranslations("Messages");

  return useMemo(() => {
    return arrangements.map((arrangement, index) => {
      let label: string = arrangement.name || "";
      if (label.length === 0) {
        label = arrangement.isDefault
          ? t("defaultArrangement")
          : `${t("arrangement")} ${index + 1}`;
      } else if (arrangement.isDefault) {
        label = `${label} (${t("defaultArrangement")})`;
      }
      return {
        label,
        value: `${arrangement.id}`,
      };
    });
  }, [arrangements, t]);
}
