import ConfirmDeleteButton from '@/components/ConfirmDeleteButton';
import EditIcon from '@/components/icons/EditIcon';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import messages from '@/i18n/messages';
import { Dispatch, SetStateAction } from 'react';
import ColumnButtons from './ColumnButtons';

type SongConfigProps = {
  columns: number;
  setColumns: Dispatch<SetStateAction<number>>;
  deleteArrangementWithId: () => void;
  onEditButtonClick: () => void;
};

export default function SongConfig({
  columns,
  setColumns,
  deleteArrangementWithId,
  onEditButtonClick,
}: SongConfigProps) {
  return (
    <>
      <h2 className="text-primary font-bold">{messages.messages.config}</h2>
      <div className={`flex mb-4 border border-primary p-2 rounded justify-between items-center`}>
        <div>
          <Label htmlFor="column-count">{messages.messages.columns}</Label>
          <ColumnButtons id="column-count" columns={columns} setColumns={setColumns} />
        </div>
        <div className="flex gap-2">
          <Button onClick={onEditButtonClick} variant="default">
            <EditIcon />
          </Button>
          <ConfirmDeleteButton
            onDelete={deleteArrangementWithId}
            alertTitle={messages.songForm.confirmDeleteTitle}
            alertDescription={messages.songForm.confirmDelete}
          />
        </div>
      </div>
    </>
  );
}
