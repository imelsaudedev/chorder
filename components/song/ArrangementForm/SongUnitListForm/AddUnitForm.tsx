import Or from "@/components/common/Or";
import UnitCircle from "@/components/song/UnitCircle";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { MouseEventHandler, useCallback } from "react";
import { useArrangementUnitsFieldArray } from "../useArrangementForm";
import useUnitsWithIndices from "./useUnitsWithIndices";

type AddUnitFormProps = {
  fieldPrefix?: string;
};
export default function AddUnitForm({ fieldPrefix = "" }: AddUnitFormProps) {
  const t = useTranslations("SongForm");

  const { units, append } = useArrangementUnitsFieldArray(fieldPrefix);
  const unitsWithIndices = useUnitsWithIndices(units);

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

  const createAddExistingUnitHandler = useCallback(
    (index: number) => {
      const handler: MouseEventHandler = (event) => {
        event.preventDefault();
        append({ ...units[index], order: (units?.length ?? 0) + 1 });
      };
      return handler;
    },
    [append, units]
  );

  return (
    <div
      className={`rounded-lg break-inside-avoid p-4 mb-2 border border-zinc-200 border-dashed bg-zinc-100`}
    >
      {units?.length > 0 && (
        <>
          <label className="font-bold text-sm">{t("addExistingUnit")}</label>
          <div className="flex gap-2 mb-2">
            {unitsWithIndices.map((unit, index) => (
              <button
                key={`unit--${index}`}
                onClick={createAddExistingUnitHandler(index)}
                className="cursor-pointer"
                aria-label={t("addUnitWithLabel", {
                  label: `${unit.type}${index}`,
                })}
              >
                <UnitCircle unitType={unit.type} typeIdx={unit.typeIndex} />
              </button>
            ))}
          </div>
          <Or />
        </>
      )}
      <div
        className="group flex items-center gap-2 w-full cursor-pointer"
        onClick={handleAddNewUnit}
      >
        <Button
          className="h-8 w-8 rounded-full text-sm grid items-center p-0"
          variant="secondary"
          id="new-unit"
          aria-label={t("newUnit")}
        >
          <PlusIcon />
        </Button>
        <Label
          htmlFor="new-unit"
          className="grow text-sm font-bold cursor-pointer"
        >
          {t("newUnit")}
        </Label>
      </div>
    </div>
  );
}
