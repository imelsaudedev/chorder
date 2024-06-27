import ChevronDownIcon from "@/components/icons/ChevronDownIcon";
import ChevronUpIcon from "@/components/icons/ChevronUpIcon";
import { Button } from "@/components/ui/button";
import { MouseEventHandler, useCallback } from "react";

export default function SortingButtons({
  moveUnitUp,
  moveUnitDown,
  songMapSize,
  index,
}: {
  moveUnitUp: (unitIndex: number) => void;
  moveUnitDown: (unitIndex: number) => void;
  songMapSize: number;
  index: number;
}) {
  const hasPrev = index > 0;
  const hasNext = index < songMapSize - 1;

  const handleMoveUp: MouseEventHandler = useCallback(
    (event) => {
      event.preventDefault();
      moveUnitUp(index);
    },
    [index, moveUnitUp]
  );

  const handleMoveDown: MouseEventHandler = useCallback(
    (event) => {
      event.preventDefault();
      moveUnitDown(index);
    },
    [index, moveUnitDown]
  );

  return (
    <div className="flex flex-col">
      <Button
        disabled={!hasPrev}
        onClick={handleMoveUp}
        variant="ghost"
        size="icon"
      >
        <ChevronUpIcon />
      </Button>
      <Button
        disabled={!hasNext}
        onClick={handleMoveDown}
        variant="ghost"
        size="icon"
      >
        <ChevronDownIcon />
      </Button>
    </div>
  );
}
