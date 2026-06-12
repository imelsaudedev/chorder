import { ClientServiceUnit } from "@/prisma/models";
import FormHeader from "./FormHeader";

type ServiceSongUnitFormProps = {
  index: number;
  unit: ClientServiceUnit;
  removeUnit: () => void;
  onChangeUnit: (unit: ClientServiceUnit) => void;
};

export default function ServiceSongUnitForm({
  index,
  unit,
  removeUnit,
  onChangeUnit,
}: ServiceSongUnitFormProps) {
  return (
    <div className="grow bg-zinc-50 border border-zinc-200 rounded-md sm:rounded-lg p-2 sm:p-4">
      <FormHeader
        index={index}
        unit={unit}
        onChangeUnit={onChangeUnit}
        onRemoveUnit={removeUnit}
      />
    </div>
  );
}
