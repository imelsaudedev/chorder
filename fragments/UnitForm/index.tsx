import ChordProViewer from '@/components/ChordProViewer';
import Combobox from '@/components/Combobox';
import FormField from '@/components/FormField';
import FormLabel from '@/components/FormLabel';
import TextInput from '@/components/TextInput';
import UnitCircle from '@/components/UnitCircle';
import CloseIcon from '@/components/icons/CloseIcon';
import { Button } from '@/components/ui/button';
import { unitTypeColorClasses } from '@/components/unit-colors';
import messages from '@/i18n/messages';
import { SongUnit, SongUnitType } from '@/models/song-unit';
import { ChangeEvent, MouseEvent, useState } from 'react';

export default function UnitForm({
  unit,
  index,
  setUnit,
  removeUnit,
  className,
}: {
  unit: SongUnit;
  index: number;
  setUnit: (unit: SongUnit) => void;
  removeUnit: () => void;
  className?: string;
}) {
  const colorClasses = unitTypeColorClasses[unit.type];
  const [preview, setPreview] = useState(false);

  const handleRemoveUnit = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    removeUnit();
  };

  const handleChangeType = (event: ChangeEvent<HTMLSelectElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setUnit(new SongUnit({ ...unit.serialize(), type: event.target.value as SongUnitType }));
  };

  const handleChangeChordpro = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setUnit(new SongUnit({ ...unit.serialize(), content: event.target.value }));
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
        <FormLabel htmlFor={`unit-type-${index}`}>{messages.unitData.unitType}</FormLabel>
        <Combobox
          value={unit.type}
          className="flex-grow"
          onChange={handleChangeType}
          options={messages.unitTypes}
          id={`unit-type-${index}`}
        />
      </FormField>

      <FormField className="flex-grow">
        <div className="flex justify-between">
          <FormLabel htmlFor={`title-${index}`}>{messages.unitData.content}</FormLabel>
          <div className="flex gap-1 items-center text-sm">
            <label htmlFor={`preview-${index}`}>{messages.messages.preview}</label>
            <input id={`preview-${index}`} type="checkbox" onChange={handlePreviewChange} checked={preview} />
          </div>
        </div>
        {preview && (
          <div className="p-2 bg-white rounded">
            <ChordProViewer chordpro={unit.content} />
          </div>
        )}
        {!preview && (
          <TextInput
            id={`content-${index}`}
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
