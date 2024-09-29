import ChordProViewer from '@/components/ChordProViewer';
import TextInput from '@/components/TextInput';
import UnitCircle from '@/components/UnitCircle';
import CloseIcon from '@/components/icons/CloseIcon';
import { Button } from '@/components/ui/button';
import { unitTypeColorClasses } from '@/components/unit-colors';
import { SongUnitSetField } from '@/forms/ArrangementForm/useArrangementFormFields';
import { SONG_UNIT_TYPES, SongUnit, SongUnitType } from '@/models/song-unit';
import { ChangeEvent, MouseEvent, useCallback, useId, useMemo, useState } from 'react';
import { ComboBoxResponsive } from '@/components/ComboBoxResponsive';
import { useTranslations } from 'next-intl';

type UnitFormProps = {
  unit: SongUnit;
  removeUnit: () => void;
  onChangeUnit: (set: SongUnitSetField) => void;
  className?: string;
};

export default function UnitForm({ unit, removeUnit, onChangeUnit, className }: UnitFormProps) {
  const t = useTranslations();

  const colorClasses = unitTypeColorClasses[unit.type];
  const [preview, setPreview] = useState(false);

  const unitTypeId = useId();
  const contentId = useId();
  const showPreviewId = useId();

  const unitTypeOptions = useMemo(
    () =>
      SONG_UNIT_TYPES.map((type) => ({
        value: type,
        label: t(`UnitTypes.${type}`),
      })),
    [t]
  );

  const handleRemoveUnit = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
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

  const handleChangeChordpro = (event: ChangeEvent<HTMLInputElement>) => {
    onChangeUnit({ field: 'content', value: event.target.value });
  };

  const handlePreviewChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPreview(event.target.checked);
  };

  const classNames = [
    'border',
    colorClasses.border,
    colorClasses.background,
    'rounded-lg',
    'break-inside-avoid',
    'flex',
    'flex-col',
    'gap-2',
    'px-2',
    'py-2',
    'mb-2',
  ];
  if (className) classNames.push(className);

  return (
    <div className={classNames.join(' ')}>
      <div className="flex gap-4 items-center justify-between">
        <UnitCircle className="w-14 h-14" unit={unit} />
        <Button onClick={handleRemoveUnit} variant="ghost" size="icon">
          <CloseIcon />
        </Button>
      </div>

      <div className="flex flex-col">
        <label className="block text-sm font-medium text-gray-900" htmlFor={unitTypeId}>
          {t('UnitData.unitType')}
        </label>
        <ComboBoxResponsive
          value={unit.type}
          className="flex-grow"
          onChange={handleChangeUnitType}
          options={unitTypeOptions}
          id={unitTypeId}
          placeholder={t('UnitData.unitTypePlaceholder')}
        />
      </div>

      <div className="flex flex-col flex-grow">
        <div className="flex justify-between">
          <label className="block text-sm font-medium text-gray-900" htmlFor={contentId}>
            {t('UnitData.content')}
          </label>
          <div className="flex gap-1 items-center text-sm">
            <label htmlFor={showPreviewId}>{t('Messages.preview')}</label>
            <input id={showPreviewId} type="checkbox" onChange={handlePreviewChange} checked={preview} />
          </div>
        </div>
        {preview && (
          <div className="p-2 bg-white rounded border">
            <ChordProViewer chordpro={unit.content} />
          </div>
        )}
        {!preview && (
          <TextInput
            id={contentId}
            className="resize-none flex-grow"
            placeholder={t('UnitData.contentPlaceholder')}
            onChange={handleChangeChordpro}
            value={unit.content}
            minRows={3}
            long
          />
        )}
      </div>
    </div>
  );
}
