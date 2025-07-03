import { useMoveUnitDown, useMoveUnitUp } from "@/hooks/moveUpDown";
import { ClientSongUnit, SongUnitType } from "@/prisma/models";
import { useCallback, useMemo } from "react";

export type ArrangementFormFields = {
  units: ClientSongUnit[];
  onUpdateUnit: (internalId: number, set: SongUnitSetField) => void;
  onAddExistingUnit: (internalId: number) => void;
  onCreateUnit: () => void;

  onMoveUnitUp: (index: number) => void;
  onMoveUnitDown: (index: number) => void;
  onRemoveUnit: (index: number) => void;
};

export default function useArrangementFormFields(
  units: ClientSongUnit[],
  appendSongUnit: (unit: ClientSongUnit) => void,
  removeSongUnit: (index: number) => void,
  updateSongUnit: (index: number, unit: ClientSongUnit) => void,
  swapSongUnits: (indexA: number, indexB: number) => void
): ArrangementFormFields {
  return {
    units,
    onUpdateUnit: useUpdateUnit(units, updateSongUnit),
    onAddExistingUnit: useAddExistingUnit(units, appendSongUnit),
    onCreateUnit: useCreateUnit(units, appendSongUnit),
    onMoveUnitUp: useMoveUnitUp(swapSongUnits),
    onMoveUnitDown: useMoveUnitDown(swapSongUnits, units.length - 1),
    onRemoveUnit: removeSongUnit,
  };
}

export type SongUnitSetField =
  | {
      field: "content";
      value: string;
    }
  | {
      field: "type";
      value: SongUnitType;
    }
  | {
      field: "order";
      value: number;
    };

function useUpdateUnit(
  units: ClientSongUnit[],
  updateSongUnit: (index: number, unit: ClientSongUnit) => void
) {
  return useCallback(
    (index: number, set: SongUnitSetField) => {
      const baseUnit = units[index];
      const newUnit = { ...baseUnit, [set.field]: set.value };
      updateSongUnit(index, newUnit);
    },
    [units, updateSongUnit]
  );
}

function useCreateUnit(
  units: ClientSongUnit[],
  appendSongUnit: (unit: ClientSongUnit) => void
) {
  return useCallback(() => {
    appendSongUnit({
      order: units.length,
      type: "BLOCK",
      content: "",
    });
  }, [appendSongUnit, units]);
}

function useAddExistingUnit(
  units: ClientSongUnit[],
  appendSongUnit: (unit: ClientSongUnit) => void
) {
  return useCallback(
    (index: number) => {
      const originalUnit = units[index];
      const newBlockType = originalUnit?.type || "BLOCK";
      appendSongUnit({
        type: newBlockType,
        content: originalUnit?.content || "",
        order: units.length,
      });
    },
    [appendSongUnit, units]
  );
}
