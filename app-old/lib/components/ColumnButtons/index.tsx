import ColumnsIcon from "@/app-old/lib/components/icons/ColumnsIcon";
import { ToggleGroup, ToggleGroupItem } from "@/components-old/ui/toggle-group";
import { useTranslations } from "next-intl";
import { Dispatch, SetStateAction } from "react";

type ColumnButtonsProps = {
  id: string;
  columns: number;
  setColumns: Dispatch<SetStateAction<number>>;
};

export default function ColumnButtons({
  id,
  columns,
  setColumns,
}: ColumnButtonsProps) {
  const t = useTranslations("Messages");
  const handleValueChange = (value: string) => {
    setColumns(parseInt(value));
  };

  return (
    <ToggleGroup
      id={id}
      variant="outline"
      type="single"
      onValueChange={handleValueChange}
      value={columns.toString()}
    >
      <ToggleGroupItem value="0" aria-label={t("auto")} className="px-4">
        AUTO
      </ToggleGroupItem>
      {[1, 2, 3, 4].map((columnCount) => (
        <ToggleGroupItem
          key={columnCount}
          value={columnCount.toString()}
          aria-label={`${columnCount} ${t("columns")}`}
        >
          <ColumnsIcon count={columnCount} />
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
