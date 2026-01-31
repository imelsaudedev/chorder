import { ClientServiceUnit } from "@/prisma/models";
import { ServiceUnitSchema } from "@/schemas/service-unit";
import { attachClosestEdge, Edge, extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index";
import { DropIndicator } from "@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useCallback, useEffect, useRef, useState } from "react";
import { useServiceUnitsFieldArray } from "../useServiceForm";
import ServiceSongUnitForm from "./ServiceSongUnitForm";

type SortableServiceUnitFormProps = {
  index: number;
  unit: ClientServiceUnit;
};

export default function SortableServiceUnitForm({
  index,
  unit,
}: SortableServiceUnitFormProps) {
  const { update, remove, setValue, move, getValues } = useServiceUnitsFieldArray();
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    return draggable({
      element: el,
      getInitialData: () => ({ type: "service-unit", index, unit }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });
  }, [index, unit]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    return dropTargetForElements({
      element: el,
      canDrop: ({ source }) => source.data.type === "service-unit",
      getData: ({ input, element }) => {
        const data = { type: "service-unit", index };
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
          sourceData.type !== "service-unit" ||
          targetData.type !== "service-unit"
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
    (unit: ServiceUnitSchema) => {
      update(index, unit);
    },
    [index, update]
  );

  return (
    <div
      ref={ref}
      className={`relative flex ${isDragging ? "opacity-50" : "opacity-100"}`}
    >
      {unit.type === "SONG" && (
        <ServiceSongUnitForm
          index={index}
          unit={unit}
          removeUnit={handleRemoveUnit}
          onChangeUnit={handleChangeUnit}
        />
      )}
      {closestEdge && <DropIndicator edge={closestEdge} gap="8px" />}
    </div>
  );
}
