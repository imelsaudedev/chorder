import Or from '@/components/Or';
import UnitCircle from '@/components/UnitCircle';
import PlusIcon from '@/components/icons/PlusIcon';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import messages, { format } from '@/i18n/messages';
import { SongUnit } from '@/models/song-unit';
import { MouseEventHandler } from 'react';

type AddUnitFormProps = {
  units: SongUnit[];
  onCreateUnit: () => void;
  onAddExistingUnit: (internalId: number) => void;
};

export default function AddUnitForm({ units, onCreateUnit, onAddExistingUnit }: AddUnitFormProps) {
  const handleAddNewUnit: MouseEventHandler = (event) => {
    event.preventDefault();
    onCreateUnit();
  };

  const createAddExistingUnitHandler = (internalId: number) => {
    const handler: MouseEventHandler = (event) => {
      event.preventDefault();
      onAddExistingUnit(internalId);
    };
    return handler;
  };

  return (
    <div className={`rounded-lg break-inside-avoid px-2 py-2 mb-2 border border-primary`}>
      {units.length > 0 && (
        <>
          <label className="font-bold text-sm">{messages.songForm.addExistingUnit}</label>
          <div className="flex gap-2 mb-2">
            {units.map((unit) => (
              <button
                key={`${unit.internalId}`}
                onClick={createAddExistingUnitHandler(unit.internalId)}
                aria-label={format(messages.songForm.addUnitWithLabel, { label: `${unit.type}${unit.typeIdx}` })}
              >
                <UnitCircle unit={unit} />
              </button>
            ))}
          </div>
          <Or />
        </>
      )}
      <div className="group flex items-center gap-2 w-full cursor-pointer" onClick={handleAddNewUnit}>
        <Button
          className="h-8 w-8 rounded-full text-sm grid items-center p-0"
          variant="secondary"
          id="new-unit"
          aria-label={messages.songForm.newUnit}
        >
          <PlusIcon />
        </Button>
        <Label htmlFor="new-unit" className="flex-grow text-sm font-bold cursor-pointer">
          {messages.songForm.newUnit}
        </Label>
      </div>
    </div>
  );
}
