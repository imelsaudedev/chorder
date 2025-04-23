import Or from '@/components/Or';
import UnitCircle from '@/components/UnitCircle';
import PlusIcon from '@/components/icons/PlusIcon';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MouseEventHandler } from 'react';
import { ArrangementFormFields } from './useArrangementFormFields';
import { useTranslations } from 'next-intl';

type AddUnitFormProps = {
  arrangementFormFields: ArrangementFormFields;
};

export default function AddUnitForm({ arrangementFormFields }: AddUnitFormProps) {
  const t = useTranslations('SongForm');
  const { units, onAddExistingUnit, onCreateUnit } = arrangementFormFields;
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
    <div className={`rounded-lg break-inside-avoid p-4 mb-2 border border-zinc-200 border-dashed bg-zinc-100`}>
      {units.length > 0 && (
        <>
          <label className="font-bold text-sm">{t('addExistingUnit')}</label>
          <div className="flex gap-2 mb-2">
            {units.map((unit) => (
              <button
                key={`${unit.internalId}`}
                onClick={createAddExistingUnitHandler(unit.internalId)}
                aria-label={t('addUnitWithLabel', { label: `${unit.type}${unit.typeIdx}` })}
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
          aria-label={t('newUnit')}
        >
          <PlusIcon />
        </Button>
        <Label htmlFor="new-unit" className="grow text-sm font-bold cursor-pointer">
          {t('newUnit')}
        </Label>
      </div>
    </div>
  );
}
