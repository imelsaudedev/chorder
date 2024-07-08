import SongUnitListForm from '@/forms/ArrangementForm/SongUnitListForm';
import useArrangementFormFields from '@/forms/ArrangementForm/useArrangementFormFields';
import { ServiceFormSchema } from '@/forms/ServiceForm/schema';
import { useCallback } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

type SongUnitListFormContainerProps = { index: number };

export default function SongUnitListFormContainer({ index }: SongUnitListFormContainerProps) {
  const { control, getValues, setValue } = useFormContext<ServiceFormSchema>();
  const {
    fields: units,
    append: appendSongUnit,
    remove: removeSongUnit,
    update: updateSongUnit,
  } = useFieldArray({
    control: control,
    name: `units.${index}.units`,
  });
  const {
    fields: songMap,
    append: appendSongMapElement,
    remove: removeSongMapElement,
    swap: swapSongMapElements,
  } = useFieldArray({
    control: control,
    name: `units.${index}.songMap`,
  });
  const lastUnitId = getValues(`units.${index}.lastUnitId`);
  const setLastUnitId = useCallback(
    (newLastUnitId: number) => setValue(`units.${index}.lastUnitId`, newLastUnitId),
    [index, setValue]
  );
  const arrangementFormFields = useArrangementFormFields(
    units,
    appendSongUnit,
    removeSongUnit,
    updateSongUnit,
    songMap,
    appendSongMapElement,
    removeSongMapElement,
    swapSongMapElements,
    lastUnitId,
    setLastUnitId
  );

  return <SongUnitListForm arrangementFormFields={arrangementFormFields} />;
}
