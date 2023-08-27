import Combobox from "@/components/Combobox";
import TextInput from "@/components/TextInput";
import UnitCircle from "@/components/UnitCircle";
import { unitTypeColorClasses } from "@/components/unit-colors";
import messages from "@/i18n/messages";
import { Unit, UnitType } from "@/models/unit";

export default function UnitForm({
  unit,
  setUnit,
}: {
  unit: Unit;
  setUnit: (unit: Unit) => void;
}) {
  const initial = messages.unitTypes[unit.type][0].toUpperCase();
  const colorClasses = unitTypeColorClasses[unit.type];

  const handleChangeType = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setUnit({ ...unit, type: event.target.value as UnitType });
  };

  return (
    <div
      className={`border ${colorClasses.border} ${colorClasses.background} rounded-lg p-2 relative flex flex-col`}
    >
      <Combobox
        onChange={handleChangeType}
        label={messages.unitData.unitType}
        options={messages.unitTypes}
        id="unit-type"
      />
      <UnitCircle
        className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2"
        initial={initial}
        unitType={unit.type}
      />
      <TextInput
        id="title"
        label={messages.unitData.title}
        placeholder={messages.unitData.titlePlaceholder}
      />
      <TextInput
        id="content"
        className="flex-grow"
        inputClassName="resize-none flex-grow"
        label={messages.unitData.content}
        placeholder={messages.unitData.contentPlaceholder}
        long
      />
    </div>
  );
}
