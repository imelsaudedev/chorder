import CloseIcon from '@/components/icons/CloseIcon';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ServiceFormSchema, SongUnitSchema } from '@/forms/ServiceForm/schema';
import { useTranslations } from 'next-intl';
import { MouseEventHandler, useCallback, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

type ServiceSongUnitEditorHeaderProps = {
  index: number;
  onRemoveUnit: () => void;
};

export default function ServiceSongUnitEditorHeader({ index, onRemoveUnit }: ServiceSongUnitEditorHeaderProps) {
  const t = useTranslations('SongData');
  const { setValue, getValues } = useFormContext<ServiceFormSchema>();
  const unit = getValues(`units.${index}`) as SongUnitSchema;

  const transpositionKeys = useMemo(() => {
    const baseKey = unit.baseKey;
    const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const baseKeyIndex = keys.indexOf(baseKey);
    return keys.map((key, index) => [key, index - baseKeyIndex] as const);
  }, [unit.baseKey]);

  const handleSemitoneTransposeChange = useCallback(
    (semitoneString: string) => setValue(`units.${index}.semitoneTranspose`, parseInt(semitoneString)),
    [index, setValue]
  );

  const handleRemoveUnit: MouseEventHandler = useCallback(
    (event) => {
      event.preventDefault();
      onRemoveUnit();
    },
    [onRemoveUnit]
  );

  return (
    <div className="flex w-full">
      <div className="flex flex-col flex-grow text-left justify-end">
        <span className="font-bold text-lg leading-none">{unit.title}</span>
        {unit.artist && <span className="text-sm">{unit.artist}</span>}
      </div>
      <div className="flex gap-2 items-end">
        <div>
          <Select defaultValue={unit.semitoneTranspose.toString()} onValueChange={handleSemitoneTransposeChange}>
            <SelectTrigger className="w-24">
              <SelectValue placeholder={t('keyPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {transpositionKeys.map(([key, semitones]) => (
                <SelectItem key={`transpose--${key}`} value={semitones.toString()}>
                  {key}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleRemoveUnit} variant="ghost" size="icon">
          <CloseIcon />
        </Button>
      </div>
    </div>
  );
}
