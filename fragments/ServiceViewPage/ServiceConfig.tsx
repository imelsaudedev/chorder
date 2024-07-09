import EditIcon from '@/components/icons/EditIcon';
import TrashIcon from '@/components/icons/TrashIcon';
import { Button } from '@/components/ui/button';
import { Dispatch, SetStateAction } from 'react';
import ColumnButtons from '../ArrangementViewPage/ColumnButtons';

type ServiceConfigProps = {
  columns: number;
  setColumns: Dispatch<SetStateAction<number>>;
  deleteService: () => void;
  onEditButtonClick: () => void;
  visible: boolean;
};

export default function ServiceConfig({
  columns,
  setColumns,
  deleteService,
  onEditButtonClick,
  visible,
}: ServiceConfigProps) {
  return (
    <div className={`flex mb-4 bg-gray-200 p-2 rounded justify-between ${visible ? '' : 'hidden'}`}>
      <div className="flex">
        <ColumnButtons id="column-count" columns={columns} setColumns={setColumns} />
      </div>
      <div className="flex">
        <form action={deleteService} className="grid place-content-center">
          <Button type="submit" variant="ghost">
            <TrashIcon />
          </Button>
        </form>
        <Button onClick={onEditButtonClick} variant="ghost">
          <EditIcon />
        </Button>
      </div>
    </div>
  );
}
