import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { MouseEventHandler, useCallback } from "react";

type SortingButtonsProps = {
  moveUnitUp: (index: number) => void;
  moveUnitDown: (index: number) => void;
  listSize: number;
  index: number;
};

export default function SortingButtons({
  moveUnitUp,
  moveUnitDown,
  listSize,
  index,
}: SortingButtonsProps) {
  const hasPrev = index > 0;
  const hasNext = index < listSize - 1;

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
        <ChevronUp />
      </Button>
      <Button
        disabled={!hasNext}
        onClick={handleMoveDown}
        variant="ghost"
        size="icon"
      >
        <ChevronDown />
      </Button>
    </div>
  );
}
