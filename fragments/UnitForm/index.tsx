import Combobox from "@/components/Combobox";
import TextInput from "@/components/TextInput";
import UnitCircle from "@/components/UnitCircle";
import { unitTypeColorClasses } from "@/components/unit-colors";
import messages from "@/i18n/messages";
import { Unit, UnitType } from "@/models/unit";
import { ChangeEvent } from "react";

export default function UnitForm({
  unit,
  index,
  setUnit,
}: {
  unit: Unit;
  index: number;
  setUnit: (unit: Unit) => void;
}) {
  const colorClasses = unitTypeColorClasses[unit.type];

  const handleChangeType = (event: ChangeEvent<HTMLSelectElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setUnit({ ...unit, type: event.target.value as UnitType });
  };

  const handleChangeTitle = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setUnit({ ...unit, title: event.target.value });
  };

  const handleChangeChordpro = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setUnit({ ...unit, content: event.target.value });
  };

  return (
    <div
      className={`border ${colorClasses.border} ${colorClasses.background} rounded-lg break-inside-avoid flex flex-col gap-2 px-2 py-2 mb-2`}
    >
      <div className="flex gap-4 items-center">
        <UnitCircle className="w-14 h-14" unit={unit} />
        <Combobox
          value={unit.type}
          className="flex-grow"
          onChange={handleChangeType}
          label={messages.unitData.unitType}
          options={messages.unitTypes}
          id={`unit-type-${index}`}
        />
      </div>

      <TextInput
        id={`title-${index}`}
        label={messages.unitData.title}
        placeholder={messages.unitData.titlePlaceholder}
        value={unit.title}
        onChange={handleChangeTitle}
      />
      <TextInput
        id={`content-${index}`}
        className="flex-grow"
        inputClassName="resize-none flex-grow"
        label={messages.unitData.content}
        placeholder={messages.unitData.contentPlaceholder}
        onChange={handleChangeChordpro}
        value={unit.content}
        long
      />
    </div>
  );
}