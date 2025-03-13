import CloseIcon from '@/components/icons/CloseIcon';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ServiceFormSchema, SongUnitSchema } from '@/forms/ServiceForm/schema';
import { useTranslations } from 'next-intl';
import { MouseEventHandler, useCallback, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

type ServiceSongUnitEditorHeaderProps = {
  index: number;
  onRemoveUnit: () => void;
  onToggleEdit: () => void;
  isEditing: boolean;
};

export default function ServiceSongUnitEditorHeader({
  index,
  onRemoveUnit,
  onToggleEdit,
  isEditing,
}: ServiceSongUnitEditorHeaderProps) {
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
    <div className="flex w-full flex-row justify-between items-start gap-4">
      {/* Coluna 1: Agrupa título, artista, switch e tom */}
      <div className="flex flex-col md:flex-row md:items-center flex-1 gap-4">
        {/* Título e artista */}
        <div className="flex flex-col md:flex-1">
          <h2 className="font-bold text-lg leading-none tracking-tight mb-1 md:mb-0">{unit.title}</h2>
          {unit.artist && <span className="text-sm text-slate-400">{unit.artist}</span>}
        </div>

        {/* Controles de edição e transposição */}
        <div className="flex flex-row items-center gap-4 md:justify-end">
          {/* Switch de edição */}
          <div className="flex items-center gap-2">
            <Label htmlFor={`edit-switch-${index}`} className="text-sm">
              {t('editSong')}
            </Label>
            <Switch id={`edit-switch-${index}`} checked={isEditing} onCheckedChange={onToggleEdit} />
          </div>

          {/* Seleção de tom */}
          <div className="flex items-center gap-2">
            <Label className="text-sm">{t('key')}</Label>
            <Select defaultValue={unit.semitoneTranspose.toString()} onValueChange={handleSemitoneTransposeChange}>
              <SelectTrigger className="w-16">
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
        </div>
      </div>

      {/* Coluna 2: Botão de Fechar */}
      <div>
        <Button onClick={handleRemoveUnit} variant="ghost" size="icon">
          <CloseIcon />
        </Button>
      </div>
    </div>
  );
}
