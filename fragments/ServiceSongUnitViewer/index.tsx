import CloseIcon from '@/components/icons/CloseIcon';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useSong from '@/hooks/useSong';
import messages from '@/i18n/messages';
import { ServiceSongUnit } from '@/models/service';
import { MouseEventHandler, useCallback, useMemo, useState } from 'react';
import ArrangementForm from '../ArrangementFormPage/ArrangementForm';

type ServiceSongUnitViewerProps = {
  unit: ServiceSongUnit;
  setSemitoneTranspose: (semitones: number) => void;
  removeUnit: () => void;
};

export default function ServiceSongUnitViewer({ unit, setSemitoneTranspose, removeUnit }: ServiceSongUnitViewerProps) {
  const songData = useSong(unit.song, unit.arrangementId);
  const { song, arrangementIndex } = songData;
  const arrangement = useMemo(() => song.arrangements[arrangementIndex], [song, arrangementIndex]);
  const handleSemitoneTransposeChange = useCallback(
    (semitoneString: string) => setSemitoneTranspose(parseInt(semitoneString)),
    [setSemitoneTranspose]
  );
  const [editMode, setEditMode] = useState(false);

  const handleToggleEditMode: MouseEventHandler = useCallback((event) => {
    event.preventDefault();
    setEditMode((prev) => !prev);
  }, []);

  const handleRemoveUnit: MouseEventHandler = useCallback(
    (event) => {
      event.preventDefault();
      removeUnit();
    },
    [removeUnit]
  );

  return (
    <div className="flex-grow border border-gray-500 rounded-md py-1 px-2">
      <div className="flex w-full">
        <div className="flex flex-col flex-grow text-left">
          <span className="font-bold text-lg leading-none">{song.title}</span>
          {song.artist && <span className="text-sm">{song.artist}</span>}
        </div>
        <Button onClick={handleRemoveUnit} variant="ghost" size="icon">
          <CloseIcon />
        </Button>
      </div>
      <div className="flex justify-between items-end my-4">
        <Button variant="outline" onClick={handleToggleEditMode}>
          {messages.serviceForm.editArrangement}
        </Button>
        <div>
          <Label>{messages.songData.key}</Label>
          <Select defaultValue="0" onValueChange={handleSemitoneTransposeChange}>
            <SelectTrigger className="w-24">
              <SelectValue placeholder={messages.songData.keyPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {arrangement.transpositionKeys.map(([key, semitones]) => (
                <SelectItem key={`transpose--${key}`} value={semitones.toString()}>
                  {key}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {editMode && <ArrangementForm songData={songData} />}
      {!editMode && (
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <div>{messages.songData.lyrics}</div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="columns-xs">
                {arrangement.lyrics.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}
