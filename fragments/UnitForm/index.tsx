import ChordProViewer from '@/components/ChordProViewer';
import TextInput from '@/components/TextInput';
import UnitCircle from '@/components/UnitCircle';
import CloseIcon from '@/components/icons/CloseIcon';
import { Button } from '@/components/ui/button';
import { unitTypeColorClasses } from '@/components/unit-colors';
import { SongUnitSetField } from '@/forms/ArrangementForm/useArrangementFormFields';
import { SONG_UNIT_TYPES, SongUnit, SongUnitType } from '@/models/song-unit';
import { ChangeEvent, useCallback, useId, useMemo } from 'react';
import { ComboBoxResponsive } from '@/components/ComboBoxResponsive';
import { useTranslations } from 'next-intl';
import { parseChordPro } from '@/chopro/music';
import BadgeSelector from '@/components/Badges/BadgeSelector';

type UnitFormProps = {
  unit: SongUnit;
  removeUnit: () => void;
  onChangeUnit: (set: SongUnitSetField) => void;
  className?: string;
};

export default function UnitForm({ unit, removeUnit, onChangeUnit, className }: UnitFormProps) {
  const t = useTranslations();

  const colorClasses = unitTypeColorClasses[unit.type];

  const unitTypeId = useId();
  const contentId = useId();

  const unitTypeOptions = useMemo(
    () =>
      SONG_UNIT_TYPES.map((type) => ({
        value: type,
        label: t(`UnitTypes.${type}`),
      })),
    [t]
  );

  const handleRemoveUnit = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      removeUnit();
    },
    [removeUnit]
  );

  const handleChangeUnitType = useCallback(
    (newValue: string) => {
      onChangeUnit({ field: 'type', value: newValue as SongUnitType });
    },
    [onChangeUnit]
  );

  const handleChangeChordpro = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChangeUnit({ field: 'content', value: event.target.value });
  };

  // Verifica se o conteúdo do ChordPro é válido
  const { hasError } = useMemo(() => {
    try {
      parseChordPro(unit.content);
      return { hasError: false };
    } catch {
      return { hasError: true };
    }
  }, [unit.content]);

  return (
    <div
      className={`border ${colorClasses.border} ${colorClasses.background} rounded-lg p-2 md:p-4 mb-2 ${
        className || ''
      }`}
    >
      <div className="flex justify-between items-center">
        <Button onClick={handleRemoveUnit} variant="ghost" size="icon">
          <CloseIcon />
        </Button>
      </div>

      <div className="mt-2">
        <BadgeSelector value={unit.type} onChange={handleChangeUnitType} />
      </div>

      <div className="flex flex-col md:grid md:grid-cols-2 gap-4 mt-4">
        <div className="flex flex-col">
          <TextInput
            id={contentId}
            className="resize-none grow bg-white font-mono"
            placeholder={t('UnitData.contentPlaceholder')}
            onChange={handleChangeChordpro}
            value={unit.content}
            minRows={1}
            long
          />
        </div>

        <div className="rounded-md bg-black/5 px-2 py-2">
          {hasError ? (
            <p className="text-red-500 text-sm">{t('Messages.invalidChordPro')}</p>
          ) : (
            <ChordProViewer chordpro={unit.content} density="compact" />
          )}
        </div>
      </div>
    </div>
  );
}
