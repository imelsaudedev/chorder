import ConfirmDeleteButton from '@/components/ConfirmDeleteButton';
import EditIcon from '@/components/icons/EditIcon';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dispatch, SetStateAction } from 'react';
import ColumnButtons from './ColumnButtons';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations();
  return (
    <>
      <h2 className="text-primary font-bold">{t('Messages.config')}</h2>
      <div className={`flex mb-4 border border-primary p-2 rounded justify-between items-center`}>
        <div>
          <Label htmlFor="column-count">{t('Messages.columns')}</Label>
          <ColumnButtons id="column-count" columns={columns} setColumns={setColumns} />
        </div>
        <div className="flex gap-2">
          <Button onClick={onEditButtonClick} variant="default">
            <EditIcon />
          </Button>
          <ConfirmDeleteButton
            onDelete={deleteArrangementWithId}
            alertTitle={t('SongForm.confirmDeleteTitle')}
            alertDescription={t('SongForm.confirmDelete')}
          />
        </div>
      </div>
    </>
  );
}
