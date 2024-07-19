import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import ServiceSongUnitEditorHeader from './ServiceSongUnitEditorHeader';
import SongUnitContentView from './SongUnitContentView';
import SongUnitListFormContainer from './SongUnitListFormContainer';

type ServiceSongUnitEditorProps = {
  index: number;
  onRemoveUnit: () => void;
};

export default function ServiceSongUnitEditor({ index, onRemoveUnit }: ServiceSongUnitEditorProps) {
  const t = useTranslations();

  const [showLyrics, setShowLyrics] = useState(false);
  const [editArrangement, setEditArrangement] = useState(false);

  return (
    <div className="flex-grow border border-gray-500 rounded-md py-1 px-2">
      <ServiceSongUnitEditorHeader index={index} onRemoveUnit={onRemoveUnit} />
      <div className="space-y-2 max-w-[400px] mt-4">
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          <div className="flex gap-2 items-center">
            <Switch id={`show-lyrics-${index}`} checked={showLyrics} onCheckedChange={setShowLyrics} />
            <Label htmlFor={`show-lyrics-${index}`}>{t('SongData.showLyrics')}</Label>
          </div>
          <div className="flex gap-2 items-center">
            <Switch id={`edit-arrangement-${index}`} checked={editArrangement} onCheckedChange={setEditArrangement} />
            <Label htmlFor={`edit-arrangement-${index}`}>{t('SongData.editSong')}</Label>
          </div>
        </div>
        {showLyrics && editArrangement && <SongUnitListFormContainer index={index} />}
        {showLyrics && !editArrangement && <SongUnitContentView index={index} />}
      </div>
    </div>
  );
}
