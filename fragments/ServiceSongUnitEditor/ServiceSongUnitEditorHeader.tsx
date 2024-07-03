import CloseIcon from '@/components/icons/CloseIcon';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import messages from '@/i18n/messages';
import { Song } from '@/models/song';
import { SongArrangement } from '@/models/song-arrangement';
import { MouseEventHandler, useCallback } from 'react';

type ServiceSongUnitEditorHeaderProps = {
  song: Song;
  arrangement: SongArrangement;
  setSemitoneTranspose: (semitones: number) => void;
  onToggleEditMode: MouseEventHandler;
  removeUnit: () => void;
};

export default function ServiceSongUnitEditorHeader({
  song,
  arrangement,
  setSemitoneTranspose,
  onToggleEditMode,
  removeUnit,
}: ServiceSongUnitEditorHeaderProps) {
  const handleSemitoneTransposeChange = useCallback(
    (semitoneString: string) => setSemitoneTranspose(parseInt(semitoneString)),
    [setSemitoneTranspose]
  );

  const handleRemoveUnit: MouseEventHandler = useCallback(
    (event) => {
      event.preventDefault();
      removeUnit();
    },
    [removeUnit]
  );

  return (
    <div className="flex w-full">
      <div className="flex flex-col flex-grow text-left justify-end">
        <span className="font-bold text-lg leading-none">{song.title}</span>
        {song.artist && <span className="text-sm">{song.artist}</span>}
      </div>
      <div className="flex gap-2 items-end">
        <Button variant="outline" onClick={onToggleEditMode}>
          {messages.serviceForm.editArrangement}
        </Button>
        <div>
          <Select defaultValue={arrangement.semitoneTranspose.toString()} onValueChange={handleSemitoneTransposeChange}>
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
        <Button onClick={handleRemoveUnit} variant="ghost" size="icon">
          <CloseIcon />
        </Button>
      </div>
    </div>
  );
}
