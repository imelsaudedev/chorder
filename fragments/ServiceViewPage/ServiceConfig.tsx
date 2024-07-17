import ConfirmDeleteButton from '@/components/ConfirmDeleteButton';
import FontSizeButtonSet from '@/components/FontSizeButtonSet';
import EditIcon from '@/components/icons/EditIcon';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
import { Dispatch, SetStateAction } from 'react';
import ColumnButtons from '../ArrangementViewPage/ColumnButtons';

type ServiceConfigProps = {
  columns: number;
  setColumns: Dispatch<SetStateAction<number>>;
  fontSize: number;
  setFontSize: Dispatch<SetStateAction<number>>;
  deleteService: () => void;
  onEditButtonClick: () => void;
};

export default function ServiceConfig({
  columns,
  setColumns,
  fontSize,
  setFontSize,
  deleteService,
  onEditButtonClick,
}: ServiceConfigProps) {
  const t = useTranslations();

  return (
    <>
      <h2 className="text-primary font-bold">{t('Messages.config')}</h2>
      <div className={`flex mb-4 border border-primary p-2 rounded justify-between items-center`}>
        <div className="flex gap-2">
          <div>
            <Label htmlFor="column-count">{t('Messages.columns')}</Label>
            <ColumnButtons id="column-count" columns={columns} setColumns={setColumns} />
          </div>
          <div>
            <Label htmlFor="font-size">{t('Messages.fontSize')}</Label>
            <FontSizeButtonSet id="font-size" fontSize={fontSize} setFontSize={setFontSize} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={onEditButtonClick} variant="default">
            <EditIcon />
          </Button>
          <ConfirmDeleteButton
            onDelete={deleteService}
            alertTitle={t('ServiceForm.confirmDeleteTitle')}
            alertDescription={t('ServiceForm.confirmDelete')}
          />
        </div>
      </div>
    </>
  );
}
