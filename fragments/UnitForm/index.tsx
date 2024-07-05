import ChordProViewer from '@/components/ChordProViewer';
import Combobox from '@/components/Combobox';
import FormField from '@/components/FormField';
import FormLabel from '@/components/FormLabel';
import TextInput from '@/components/TextInput';
import UnitCircle from '@/components/UnitCircle';
import CloseIcon from '@/components/icons/CloseIcon';
import { Button } from '@/components/ui/button';
import { unitTypeColorClasses } from '@/components/unit-colors';
import { UnitSetField } from '@/forms/ArrangementForm/useUnitList';
import messages from '@/i18n/messages';
import { SongUnit, SongUnitType } from '@/models/song-unit';
import { ChangeEvent, MouseEvent, useCallback, useId, useState } from 'react';

type UnitFormProps = {
  unit: SongUnit;
  removeUnit: () => void;
  onChangeUnit: (set: UnitSetField) => void;
  className?: string;
};

export default function UnitForm({ unit, removeUnit, onChangeUnit, className }: UnitFormProps) {
  const colorClasses = unitTypeColorClasses[unit.type];
  const [preview, setPreview] = useState(false);

  const unitTypeId = useId();
  const contentId = useId();
  const showPreviewId = useId();

  const handleRemoveUnit = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      removeUnit();
    },
    [removeUnit]
  );

  const handleChangeUnitType = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      onChangeUnit({ field: 'type', value: event.target.value as SongUnitType });
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

      <FormField>
        <FormLabel htmlFor={unitTypeId}>{messages.unitData.unitType}</FormLabel>
        <Combobox
          value={unit.type}
          className="flex-grow"
          onChange={handleChangeUnitType}
          options={messages.unitTypes}
          id={unitTypeId}
        />
      </FormField>

      <FormField className="flex-grow">
        <div className="flex justify-between">
          <FormLabel htmlFor={contentId}>{messages.unitData.content}</FormLabel>
          <div className="flex gap-1 items-center text-sm">
            <label htmlFor={showPreviewId}>{messages.messages.preview}</label>
            <input id={showPreviewId} type="checkbox" onChange={handlePreviewChange} checked={preview} />
          </div>
        </div>
        {preview && (
          <div className="p-2 bg-white rounded">
            <ChordProViewer chordpro={unit.content} />
          </div>
        )}
        {!preview && (
          <TextInput
            id={contentId}
            className="resize-none flex-grow"
            placeholder={messages.unitData.contentPlaceholder}
            onChange={handleChangeChordpro}
            value={unit.content}
            minRows={3}
            long
          />
        )}
      </FormField>
    </div>
  );
}
