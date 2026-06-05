import { Button } from "@/components/ui/button";
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
        notes: null,
      });
    },
    [append, units?.length]
  );

  return (
    <div className="rounded-lg p-4 border border-zinc-200 border-dashed bg-zinc-100">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleAddNewUnit}
          className="flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          {t("newUnit")}
        </Button>
      </div>
    </div>
  );
}
