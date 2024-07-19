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
import useHrefWithParams from '@/hooks/useHrefWithParams';

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
  const createHrefWithParam = useHrefWithParams();

  return (
    <>
      <h2 className="text-primary font-bold">{t('Messages.config')}</h2>
      <div
        className={`flex flex-col md:flex-row mb-4 border border-primary p-2 rounded justify-between items-start md:items-center gap-4`}
      >
        <div className="flex gap-2 flex-col md:flex-row">
          <div>
            <Label htmlFor="column-count">{t('Messages.columns')}</Label>
            <ColumnButtons id="column-count" columns={columns} setColumns={setColumns} />
          </div>
          <div>
            <Label htmlFor="mode">{t('Messages.mode')}</Label>
            <ModeButtonSet id="mode" mode={mode} setMode={setMode} />
          </div>
          <div>
            <Label htmlFor="font-size">{t('Messages.fontSize')}</Label>
            <FontSizeButtonSet id="font-size" fontSize={fontSize} setFontSize={setFontSize} />
          </div>
        </div>

        <div className="flex gap-2 self-end">
          <Button variant="default" asChild>
            <Link href={createHrefWithParam('edit', 'true')}>
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
