import SongUnitListForm from "@/components/song/ArrangementForm/SongUnitListForm";
import { ClientServiceUnit } from "@/prisma/models";
import { useState } from "react";
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
  const [editArrangement, setEditArrangement] = useState(false);

  return (
    <div className="grow bg-zinc-50 border border-zinc-200 rounded-md sm:rounded-lg p-2 sm:p-4 ">
      <FormHeader
        index={index}
        unit={unit}
        onChangeUnit={onChangeUnit}
        onRemoveUnit={removeUnit}
        onToggleEdit={() => setEditArrangement((prev) => !prev)}
        isEditing={editArrangement}
      />

      {editArrangement && (
        <SongUnitListForm fieldPrefix={`units[${index}].arrangement.`} />
      )}
    </div>
  );
}
