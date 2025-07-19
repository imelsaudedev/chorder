import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { MouseEventHandler, useCallback } from "react";
import { useArrangementUnitsFieldArray } from "../useArrangementForm";

type AddUnitFormProps = {
  fieldPrefix?: string;
};
export default function AddUnitForm({ fieldPrefix = "" }: AddUnitFormProps) {
  const t = useTranslations("SongForm");

  const { units, append } = useArrangementUnitsFieldArray(fieldPrefix);

  const handleAddNewUnit: MouseEventHandler = useCallback(
    (event) => {
      event.preventDefault();
      append({
        type: "BLOCK",
        content: "",
        order: (units?.length ?? 0) + 1,
      });
    },
    [append, units?.length]
  );

  return (
    <Label
      htmlFor="new-unit"
      className="rounded-lg break-inside-avoid p-4 mb-2 border border-zinc-200 border-dashed bg-zinc-100 group flex items-center gap-2 w-full text-sm font-bold cursor-pointer"
    >
      <Button
        className="h-8 w-8 rounded-full text-sm grid items-center p-0"
        variant="secondary"
        id="new-unit"
        aria-label={t("newUnit")}
        onClick={handleAddNewUnit}
      >
        <PlusIcon />
      </Button>
      {t("newUnit")}
    </Label>
  );
}
