import ColumnsIcon from "@/components/icons/ColumnsIcon";
import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction } from "react";

export default function ColumnButtons({
  columns,
  setColumns,
}: {
  columns: number;
  setColumns: Dispatch<SetStateAction<number>>;
}) {
  return (
    <div>
      {[1, 2, 3, 4].map((columnCount) => (
        <Button
          key={columnCount}
          onClick={() => setColumns(columnCount)}
          variant="outline"
          size="icon"
          rounded={columnCount === 1 ? "left" : columnCount === 4 ? "right" : "none"}
          disabled={columns === columnCount}
        >
          <ColumnsIcon count={columnCount} />
        </Button>
      ))}
    </div>
  );
}
