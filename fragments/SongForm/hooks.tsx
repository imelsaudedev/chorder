import { MouseEventHandler, useEffect, useState } from "react";
import { updateTypeIndices } from "./utils";
import { getChords, getKeyFromChords } from "@/chopro/music";
import { SongArrangement } from "@/models/song";
import { SongUnit } from "@/models/song-unit";

export const useArrangementUnits = (arrangement: SongArrangement | null) => {
  const [computedKey, setComputedKey] = useState(arrangement?.key || "");

  useEffect(() => {
    const allChords = arrangementUnits
      .map((arrangementUnit) => getChords(arrangementUnit.unit?.content))
      .flat();
    setComputedKey(getKeyFromChords(allChords) || "");
  }, [arrangementUnits]);

  const handleAddUnit = (unit: Unit) => {
    setArrangementUnits((units) =>
      updateTypeIndices([
        ...units,
        {
          arrangement: arrangement || undefined,
          arrangementId: arrangement?.id || undefined,
          unit,
          unitId: unit.id || undefined,
          indexInArrangement: units.length,
        },
      ])
    );
  };

  const handleCreateUnit = () => {
    handleAddUnit({
      type: "SONG_BLOCK",
      content: "",
      preview: false,
      localUID: createLocalUID(getExistingUIDs(arrangementUnits)),
    });
  };

  const handleUpdateUnit = (unit: Unit) => {
    setArrangementUnits((units) => {
      return updateTypeIndices(
        units.map((arrangementUnit) => {
          if (arrangementUnit.unit?.localUID === unit.localUID) {
            return {
              ...arrangementUnit,
              unit: unit,
            };
          }
          return arrangementUnit;
        })
      );
    });
  };

  const buildRemoveUnitHandler = (index: number) => {
    return () => {
      setArrangementUnits((units) => {
        const newUnits = [...units];
        newUnits.splice(index, 1);
        newUnits.forEach((unit, index) => {
          unit.indexInArrangement = index;
        });
        return updateTypeIndices(newUnits);
      });
    };
  };

  const buildMoveUpHandler = (index: number) => {
    const hasPrev = index > 0;

    const handleMoveUp: MouseEventHandler | undefined = hasPrev
      ? (event) => {
          setArrangementUnits((currSequence) => {
            const newSequence = [...currSequence];
            const selectedUnit = newSequence[index];
            const prevUnit = newSequence[index - 1];

            newSequence.forEach((unit, idx) => {
              unit.indexInArrangement = idx;
            });

            newSequence[index] = prevUnit;
            newSequence[index - 1] = selectedUnit;
            return newSequence;
          });
          event.preventDefault();
        }
      : undefined;

    return handleMoveUp;
  };

  const buildMoveDownHandler = (index: number) => {
    const hasNext = index < arrangementUnits.length - 1;

    const handleMoveDown: MouseEventHandler | undefined = hasNext
      ? (event) => {
          setArrangementUnits((currSequence) => {
            const newSequence = [...currSequence];
            const selectedUnit = newSequence[index];
            const nextUnit = newSequence[index + 1];

            newSequence.forEach((unit, idx) => {
              unit.indexInArrangement = idx;
            });

            newSequence[index] = nextUnit;
            newSequence[index + 1] = selectedUnit;
            return newSequence;
          });
          event.preventDefault();
        }
      : undefined;

    return handleMoveDown;
  };

  return [
    arrangementUnits,
    computedKey,
    handleAddUnit,
    handleCreateUnit,
    handleUpdateUnit,
    buildRemoveUnitHandler,
    buildMoveUpHandler,
    buildMoveDownHandler,
  ] as const;
};

function getExistingUIDs(arrangementUnits: ArrangementUnit[]) {
  return arrangementUnits
    .map((unit) => unit.unit?.localUID)
    .filter(Boolean) as string[];
}

function createLocalUID(existingUIDs: string[]): string {
  let newUID = Math.floor(Math.random() * 1000000).toString();
  while (existingUIDs.includes(newUID)) {
    newUID = Math.floor(Math.random() * 1000000).toString();
  }
  existingUIDs.push(newUID);
  return newUID;
}
