import FontSizeButtonSet from '@/components/FontSizeButtonSet';
import ModeButtonSet, { Mode } from '@/components/ModeButtonSet';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
import { Dispatch, SetStateAction } from 'react';
import ColumnButtons from '../ArrangementViewPage/ColumnButtons';

type ServiceConfigProps = {
  columns: number;
  setColumns: Dispatch<SetStateAction<number>>;
  fontSize: number;
  setFontSize: Dispatch<SetStateAction<number>>;
  mode: Mode;
  setMode: Dispatch<SetStateAction<Mode>>;
};

export default function ServiceConfig({
  columns,
  setColumns,
  fontSize,
  setFontSize,
  mode,
  setMode,
}: ServiceConfigProps) {
  const t = useTranslations();

  return (
    <div className="p-4 mb-8 rounded-lg border border-slate-300">
      <h2 className="text-lg font-semibold text-primary pb-2">{t('Messages.config')}</h2>
      <div className="flex flex-col md:flex-row gap-4">
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
    </div>
  );
}
