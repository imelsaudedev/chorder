import FontSizeButtonSet from '@/components/FontSizeButtonSet';
import KeyButtonSet from '@/components/KeyButtonSet';
import ModeButtonSet, { Mode } from '@/components/ModeButtonSet';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
import { Dispatch, SetStateAction } from 'react';
import ColumnButtons from './ColumnButtons';

type SongConfigProps = {
  columns: number;
  setColumns: Dispatch<SetStateAction<number>>;
  fontSize: number;
  setFontSize: Dispatch<SetStateAction<number>>;
  mode: Mode;
  setMode: Dispatch<SetStateAction<Mode>>;
  originalKey: string;
  transpose: number;
  setTranspose: Dispatch<SetStateAction<number>>;
};

export default function SongConfig({
  columns,
  setColumns,
  fontSize,
  setFontSize,
  mode,
  setMode,
  originalKey,
  transpose,
  setTranspose,
}: SongConfigProps) {
  const t = useTranslations();

  return (
    <div className="p-4 mb-8 rounded-lg border border-slate-300">
      <h2 className="text-lg font-semibold text-primary pb-2">{t('Messages.config')}</h2>
      <div className="flex flex-col md:flex-row gap-4">
        <div>
          <Label htmlFor="font-size">{t('SongData.key')}</Label>
          <KeyButtonSet originalKey={originalKey} transpose={transpose} setTranspose={setTranspose} />
        </div>
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
