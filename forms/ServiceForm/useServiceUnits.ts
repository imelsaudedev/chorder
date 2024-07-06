import { useMoveUnitDown, useMoveUnitUp } from '@/hooks/moveUpDown';
import { UseFieldArrayReturn } from 'react-hook-form';
import { ServiceFormSchema } from './schema';
import { RequiredArrangement, RequiredArrangements, RequiredSlug, SongWith } from '@/models/song';
import { useCallback } from 'react';

export type ServiceUnitsHook = {
  unitsLength: number;
  onCreateUnit: (song: SongWith<RequiredSlug & RequiredArrangement & RequiredArrangements>) => void;
  onMoveUnitUp: (index: number) => void;
  onMoveUnitDown: (index: number) => void;
  onRemoveUnit: (index: number) => void;
};

export default function useServiceUnits(
  unitsFieldArray: UseFieldArrayReturn<ServiceFormSchema, 'units'>
): ServiceUnitsHook {
  const { fields: unitsFields, remove: deleteFromUnits, swap: swapUnitElements } = unitsFieldArray;

  const onCreateUnit = useCallback((song: SongWith<RequiredSlug & RequiredArrangement & RequiredArrangements>) => {
    unitsFieldArray.append({
      arrangement: {
        songMap: song.arrangement.songMap.map((internalId) => ({ internalId })),
        semitoneTranspose: song.arrangement.semitoneTranspose,
        // TODO: WHAT TO DO WITH THE UNIT LIST???
      },
    });
  }, []);
  const onMoveUnitUp = useMoveUnitUp(swapUnitElements);
  const onMoveUnitDown = useMoveUnitDown(swapUnitElements, unitsFields.length - 1);

  return {
    unitsLength: unitsFields.length,
    onMoveUnitUp,
    onMoveUnitDown,
    onRemoveUnit: deleteFromUnits,
  };
}
