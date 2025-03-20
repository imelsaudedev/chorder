import FontSizeButtonSet from '@/components/FontSizeButtonSet';
import KeyButtonSet from '@/components/KeyButtonSet';
import ModeButtonSet, { Mode } from '@/components/ModeButtonSet';
import DensityButtonSet from '@/components/DensityButtonSet';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
import { Dispatch, SetStateAction } from 'react';
import ColumnButtons from './ColumnButtons';

type Density = 'compact' | 'normal';

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
  density: Density;
  setDensity: Dispatch<SetStateAction<Density>>;
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
  density,
  setDensity,
}: SongConfigProps) {
  const t = useTranslations();

  return (
    <div className="p-4 mt-2 sm:mt-4 rounded-lg bg-slate-100">
      <h2 className="text-lg font-semibold text-primary pb-2">{t('Messages.config')}</h2>
      <div className="flex flex-col sm:flex-row sm:flex-wrap md:justify-start items-start gap-x-6 gap-y-4">
        <div className="flex flex-col gap-1">
          <Label htmlFor="font-size">{t('SongData.key')}</Label>
          <KeyButtonSet originalKey={originalKey} transpose={transpose} setTranspose={setTranspose} />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="column-count">{t('Messages.columns')}</Label>
          <ColumnButtons id="column-count" columns={columns} setColumns={setColumns} />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="font-size">{t('Messages.fontSize')}</Label>
          <FontSizeButtonSet id="font-size" fontSize={fontSize} setFontSize={setFontSize} />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="mode">{t('Messages.mode')}</Label>
          <ModeButtonSet id="mode" mode={mode} setMode={setMode} />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="density">{t('Messages.density')}</Label>
          <DensityButtonSet density={density} setDensity={setDensity} />
        </div>
      </div>
    </div>
  );
}
