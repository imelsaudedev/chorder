import ColumnsIcon from '@/components/icons/ColumnsIcon';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import messages from '@/i18n/messages';
import { Dispatch, SetStateAction } from 'react';

type ColumnButtonsProps = {
  id: string;
  columns: number;
  setColumns: Dispatch<SetStateAction<number>>;
};

export default function ColumnButtons({ id, columns, setColumns }: ColumnButtonsProps) {
  const handleValueChange = (value: string) => {
    setColumns(parseInt(value));
  };

  return (
    <ToggleGroup
      id={id}
      type="single"
      onValueChange={handleValueChange}
      value={columns.toString()}
      className="border rounded p-1"
    >
      <ToggleGroupItem value="0" aria-label={messages.messages.auto}>
        AUTO
      </ToggleGroupItem>
      {[1, 2, 3, 4].map((columnCount) => (
        <ToggleGroupItem
          key={columnCount}
          value={columnCount.toString()}
          aria-label={`${columnCount} ${messages.messages.columns}`}
        >
          <ColumnsIcon count={columnCount} />
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
