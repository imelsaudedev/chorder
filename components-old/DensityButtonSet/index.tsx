import { Dispatch, SetStateAction, useCallback } from 'react';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import { useTranslations } from 'next-intl';

export type Density = 'compact' | 'normal';

type DensityButtonSetProps = { id?: string; density: Density; setDensity: Dispatch<SetStateAction<Density>> };

export default function DensityButtonSet({ id, density, setDensity }: DensityButtonSetProps) {
  const t = useTranslations('Messages');
  const handleValueChange = useCallback(
    (value: string) => {
      if (value) setDensity(value as Density);
    },
    [setDensity]
  );

  return (
    <fieldset>
      <legend className="sr-only">{t('density')}</legend>
      <ToggleGroup id={id} type="single" onValueChange={handleValueChange} value={density}>
        <ToggleGroupItem value="normal" aria-label={t('normal')}>
          {t('normal')}
        </ToggleGroupItem>
        <ToggleGroupItem value="compact" aria-label={t('compact')}>
          {t('compact')}
        </ToggleGroupItem>
      </ToggleGroup>
    </fieldset>
  );
}
