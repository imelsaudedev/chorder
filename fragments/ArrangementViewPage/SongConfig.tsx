import ConfirmDeleteButton from '@/components/ConfirmDeleteButton';
import EditIcon from '@/components/icons/EditIcon';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dispatch, SetStateAction } from 'react';
import ColumnButtons from './ColumnButtons';
import { useTranslations } from 'next-intl';
import FontSizeButtonSet from '@/components/FontSizeButtonSet';
import ModeButtonSet, { Mode } from '@/components/ModeButtonSet';
import Link from 'next/link';

type SongConfigProps = {
  columns: number;
  setColumns: Dispatch<SetStateAction<number>>;
  fontSize: number;
  setFontSize: Dispatch<SetStateAction<number>>;
  mode: Mode;
  setMode: Dispatch<SetStateAction<Mode>>;
  deleteArrangementWithId: () => void;
};

export default function SongConfig({
  columns,
  setColumns,
  fontSize,
  setFontSize,
  mode,
  setMode,
  deleteArrangementWithId,
}: SongConfigProps) {
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
          <div>
            <Label htmlFor="mode">{t('Messages.mode')}</Label>
            <ModeButtonSet id="mode" mode={mode} setMode={setMode} />
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="default" asChild>
            <Link href="?edit=true">
              <EditIcon />
            </Link>
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
