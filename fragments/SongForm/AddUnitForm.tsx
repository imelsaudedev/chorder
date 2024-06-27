import { MouseEventHandler } from "react";
import messages from "@/i18n/messages";
import UnitCircle from "@/components/UnitCircle";
import Or from "@/components/Or";
import PlusIcon from "@/components/icons/PlusIcon";
import { SongUnit } from "@/models/song-unit";

export default function AddUnitForm({
  units,
  onCreateUnit,
  onAddExistingUnit,
}: {
  units: SongUnit[];
  onCreateUnit: () => void;
  onAddExistingUnit: (unit: SongUnit) => void;
}) {
  const handleAddNewUnit: MouseEventHandler = (event) => {
    event.preventDefault();
    onCreateUnit();
  };

  const createAddExistingUnitHandler = (unit: SongUnit) => {
    const handler: MouseEventHandler = (event) => {
      event.preventDefault();
      onAddExistingUnit(unit);
    };
    return handler;
  };

  return (
    <div
      className={`border rounded-lg break-inside-avoid px-2 py-2 mb-2 bg-purple-100 border-purple-400`}
    >
      {units.length > 0 && (
        <>
          <label className="font-bold text-sm">
            {messages.songForm.addExistingUnit}
          </label>
          <div className="flex gap-2 mb-2">
            {units.map((unit) => (
              <button
                key={`${unit.internalId}`}
                onClick={createAddExistingUnitHandler(unit)}
              >
                <UnitCircle unit={unit} />
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
        <button
          className="h-8 w-8 text-sm shadow-lg inline-flex items-center justify-center bg-none rounded-full bg-purple-600 text-purple-50 group-hover:bg-purple-500 group-hover:shadow-xl"
          id="new-unit"
        >
          <PlusIcon />
        </button>
        <label
          htmlFor="new-unit"
          className="flex-grow text-sm font-bold cursor-pointer"
        >
          {messages.songForm.newUnit}
        </label>
      </div>
    </div>
  );
}
