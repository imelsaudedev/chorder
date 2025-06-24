import SongUnitListForm from "../../../(main)/songs/ArrangementForm/SongUnitListForm";
import useArrangementFormFields from "../../../(main)/songs/ArrangementForm/useArrangementFormFields";
import { ServiceFormSchema } from "../../../(main)/services/ServiceForm/schema";
import { useCallback } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";

type SongUnitListFormContainerProps = { index: number };

export default function SongUnitListFormContainer({
  index,
}: SongUnitListFormContainerProps) {
  const { control } = useFormContext<ServiceFormSchema>();
  const {
    fields: units,
    append: appendSongUnit,
    remove: removeSongUnit,
    update: updateSongUnit,
    swap: swapSongUnits,
  } = useFieldArray({
    control: control,
    name: `units.${index}.arrangement.units`,
  });
  const arrangementFormFields = useArrangementFormFields(
    units,
    appendSongUnit,
    removeSongUnit,
    updateSongUnit,
    swapSongUnits
  );

  return <SongUnitListForm arrangementFormFields={arrangementFormFields} />;
}
