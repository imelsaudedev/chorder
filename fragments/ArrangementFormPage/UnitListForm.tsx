import SortingButtons from '@/components/SortingButtons';
import UnitForm, { UnitSetField } from '../UnitForm';
import AddUnitForm from './AddUnitForm';
import { ChangeEvent, Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import { SongArrangement } from '@/models/song-arrangement';
import { ArrangementFormSchema, UnitMapElementSchema } from './arrangement-form-schema';
import {
  useFieldArray,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFieldArrayReturn,
  UseFormReturn,
} from 'react-hook-form';
import { SongUnit, SongUnitType } from '@/models/song-unit';

type ArrangementFormProps = {
  arrangement: SongArrangement;
  form: UseFormReturn<ArrangementFormSchema>;
  units: SongUnit[];
  setUnits: Dispatch<SetStateAction<SongUnit[]>>;
  setUnitsToDirty: () => void;
  lastUnitId: number;
  setLastUnitId: Dispatch<SetStateAction<number>>;
};

export default function UnitListForm({
  arrangement,
  form,
  units,
  setUnits,
  setUnitsToDirty,
  lastUnitId,
  setLastUnitId,
}: ArrangementFormProps) {
  const { control } = form;
  const unitMapFieldArray = useFieldArray({
    control,
    name: 'unitMap',
  });
  const { fields: unitMapFields, append: appendToUnitMap } = unitMapFieldArray;
  const updateUnit = useUpdateUnit(setUnits, setUnitsToDirty);
  const deleteUnit = useDeleteUnit(setUnits, setUnitsToDirty);
  const createUnit = useCreateUnit(appendToUnitMap, setUnits, lastUnitId, setLastUnitId, setUnitsToDirty);
  const addUnit = useCallback(
    (internalId: number) => {
      appendToUnitMap({ internalId });
    },
    [appendToUnitMap]
  );

  return (
    <section className="max-w-lg mx-auto">
      {unitMapFields.map((field, index) => (
        <SortableUnitForm
          key={field.id}
          field={field}
          index={index}
          units={units}
          unitMapFieldArray={unitMapFieldArray}
          updateUnit={updateUnit}
          deleteUnit={deleteUnit}
        />
      ))}
      <div className="pl-10">
        <AddUnitForm units={arrangement.units} onCreateUnit={createUnit} onAddExistingUnit={addUnit} />
      </div>
    </section>
  );
}

type SortableUnitFormProps = {
  field: UnitMapElementSchema;
  index: number;
  units: SongUnit[];
  unitMapFieldArray: UseFieldArrayReturn<ArrangementFormSchema, 'unitMap'>;
  updateUnit: (internalId: number, set: UnitSetField) => void;
  deleteUnit: (internalId: number) => void;
};

function useUpdateUnit(setUnits: Dispatch<SetStateAction<SongUnit[]>>, setUnitsToDirty: () => void) {
  return useCallback(
    (internalId: number, set: UnitSetField) => {
      setUnits((units) => {
        const unitIndex = units.findIndex((u) => u.internalId === internalId);
        if (unitIndex === -1) return units;

        const newUnits = [...units];
        const updatedUnit = { ...units[unitIndex], [set.field]: set.value };
        newUnits[unitIndex] = updatedUnit;

        updateUnitTypeIndices(newUnits);

        return newUnits;
      });
      setUnitsToDirty();
    },
    [setUnits, setUnitsToDirty]
  );
}

function updateUnitTypeIndices(newUnits: SongUnit[]) {
  const countByType = new Map<SongUnitType, number>();
  newUnits.forEach((unit) => {
    countByType.set(unit.type, (countByType.get(unit.type) || 0) + 1);
    unit.typeIdx = countByType.get(unit.type);
  });
}

function useDeleteUnit(setUnits: Dispatch<SetStateAction<SongUnit[]>>, setUnitsToDirty: () => void) {
  return useCallback(
    (internalId: number) => {
      setUnits((units) => units.filter((u) => u.internalId !== internalId));
      setUnitsToDirty();
    },
    [setUnits, setUnitsToDirty]
  );
}

function useCreateUnit(
  appendToUnitMap: UseFieldArrayAppend<ArrangementFormSchema, 'unitMap'>,
  setUnits: Dispatch<SetStateAction<SongUnit[]>>,
  lastUnitId: number,
  setLastUnitId: Dispatch<SetStateAction<number>>,
  setUnitsToDirty: () => void
) {
  return useCallback(() => {
    const unit: SongUnit = {
      internalId: lastUnitId + 1,
      type: 'BLOCK',
      content: '',
      typeIdx: 1,
    };
    setLastUnitId(unit.internalId);
    setUnits((units) => {
      const newUnits = [...units, unit];
      updateUnitTypeIndices(newUnits);
      return newUnits;
    });
    setUnitsToDirty();
    appendToUnitMap({ internalId: unit.internalId });
  }, [appendToUnitMap, lastUnitId, setLastUnitId, setUnits, setUnitsToDirty]);
}

function SortableUnitForm({ field, index, unitMapFieldArray, units, updateUnit, deleteUnit }: SortableUnitFormProps) {
  const { fields: unitMapFields, remove: deleteFromUnitMap, swap: swapUnitMapElements } = unitMapFieldArray;
  const unit = useMemo(() => units.find((u) => u.internalId === field.internalId), [field.internalId, units]);

  const handleChangeUnit = useCallback(
    (set: UnitSetField) => {
      updateUnit(field.internalId, set);
    },
    [field.internalId, updateUnit]
  );
  const moveUnitUp = useMoveUnitUp(swapUnitMapElements);
  const moveUnitDown = useMoveUnitDown(swapUnitMapElements, unitMapFields.length - 1);
  const removeUnit = useRemoveUnit(field, unitMapFields, deleteFromUnitMap, deleteUnit, index);

  if (!unit) return null;
  return (
    <div className="flex">
      <SortingButtons
        moveUnitUp={moveUnitUp}
        moveUnitDown={moveUnitDown}
        listSize={unitMapFields.length}
        index={index}
      />
      <UnitForm unit={unit} removeUnit={removeUnit} onChangeUnit={handleChangeUnit} className="flex-grow" />
    </div>
  );
}

type SwapFunction = (index1: number, index2: number) => void;

function useRemoveUnit(
  field: { internalId: number },
  unitMapFields: UnitMapElementSchema[],
  deleteFromUnitMap: UseFieldArrayRemove,
  deleteUnit: (internalId: number) => void,
  index: number
) {
  return useCallback(() => {
    const internalId = field.internalId;
    if (unitMapFields.filter((f) => f.internalId === internalId).length === 1) {
      deleteUnit(internalId);
    }
    deleteFromUnitMap(index);
  }, [deleteFromUnitMap, deleteUnit, field.internalId, index, unitMapFields]);
}

function useMoveUnitDown(swapUnitMapElements: SwapFunction, maxIndex: number) {
  return useCallback(
    (index: number) => {
      if (index === maxIndex) return;
      swapUnitMapElements(index, index + 1);
    },
    [maxIndex, swapUnitMapElements]
  );
}

function useMoveUnitUp(swapUnitMapElements: SwapFunction) {
  return useCallback(
    (index: number) => {
      if (index === 0) return;
      swapUnitMapElements(index, index - 1);
    },
    [swapUnitMapElements]
  );
}
