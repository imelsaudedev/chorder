import { ClientSongUnit } from "@/prisma/models";
import { attachClosestEdge, Edge, extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index";
import { DropIndicator } from "@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useCallback, useEffect, useRef, useState } from "react";
import { useArrangementUnitsFieldArray } from "../useArrangementForm";
import UnitForm from "./UnitForm";

type SortableUnitFormProps = {
  index: number;
  unit: ClientSongUnit;
  fieldPrefix?: string;
};

export default function SortableUnitForm({
  index,
  unit,
  fieldPrefix = "",
}: SortableUnitFormProps) {
  const { update, remove, setValue, insert, move, getValues } =
    useArrangementUnitsFieldArray(fieldPrefix);
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    return draggable({
      element: el,
      getInitialData: () => ({
        type: "arrangement-unit",
        index,
        unit,
        fieldPrefix,
      }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });
  }, [index, unit]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    return dropTargetForElements({
      element: el,
      canDrop: ({ source }) =>
        source.data.type === "arrangement-unit" &&
        source.data.fieldPrefix === fieldPrefix,
      getData: ({ input, element }) => {
        const data = { type: "arrangement-unit", index, fieldPrefix };
        return attachClosestEdge(data, {
          input,
          element,
          allowedEdges: ["top", "bottom"],
        });
      },
      onDragEnter: ({ self }) => {
        setClosestEdge(extractClosestEdge(self.data));
      },
      onDrag: ({ self }) => {
        setClosestEdge(extractClosestEdge(self.data));
      },
      onDragLeave: () => {
        setClosestEdge(null);
      },
      onDrop: ({ source, self }) => {
        setClosestEdge(null);
        const sourceData = source.data;
        const targetData = self.data;
        if (
          sourceData.type !== "arrangement-unit" ||
          targetData.type !== "arrangement-unit" ||
          sourceData.fieldPrefix !== targetData.fieldPrefix
        )
          return;

        const sourceIndex = sourceData.index as number;
        const targetIndex = targetData.index as number;
        const edge = extractClosestEdge(targetData);

        const destinationIndex = getReorderDestinationIndex({
          startIndex: sourceIndex,
          indexOfTarget: targetIndex,
          closestEdgeOfTarget: edge,
          axis: "vertical",
        });

        if (sourceIndex !== destinationIndex) {
          move(sourceIndex, destinationIndex);
          // Re-sync orders using fresh values from the form
          const currentUnits = getValues();
          for (let i = 0; i < currentUnits.length; i++) {
            setValue(i, "order", i + 1);
          }
        }
      },
    });
  }, [index, move, getValues, setValue]);

  const handleRemoveUnit = useCallback(() => {
    const currentUnits = getValues();
    for (let i = index + 1; i < currentUnits.length; i++) {
      setValue(i, "order", i); // i is already (old_index + 1) - 1
    }
    remove(index);
  }, [index, remove, setValue, getValues]);

  const handleChangeUnit = useCallback(
    (unit: ClientSongUnit) => {
      update(index, unit);
    },
    [index, update]
  );

  const handleDuplicateUnit = useCallback(() => {
    const currentUnits = getValues();
    const newUnit = { ...unit, order: unit.order + 1 };
    for (let i = index + 1; i < currentUnits.length; i++) {
      setValue(i, "order", currentUnits[i].order + 1);
    }
    insert(index + 1, newUnit);
  }, [index, insert, setValue, unit, getValues]);

  return (
    <div
      ref={ref}
      className={`relative flex ${isDragging ? "opacity-50" : "opacity-100"}`}
    >
      <UnitForm
        unit={unit}
        removeUnit={handleRemoveUnit}
        duplicateUnit={handleDuplicateUnit}
        onChangeUnit={handleChangeUnit}
        className="grow"
      />
      {closestEdge && <DropIndicator edge={closestEdge} gap="8px" />}
    </div>
  );
}
