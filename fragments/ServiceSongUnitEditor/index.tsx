import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ServiceSongUnitEditorHeader from './ServiceSongUnitEditorHeader';
import SongUnitContentView from './SongUnitContentView';
import SongUnitListFormContainer from './SongUnitListFormContainer';
import { useTranslations } from 'next-intl';

type ServiceSongUnitEditorProps = {
  index: number;
  onRemoveUnit: () => void;
};

export default function ServiceSongUnitEditor({ index, onRemoveUnit }: ServiceSongUnitEditorProps) {
  const t = useTranslations();

  return (
    <div className="flex-grow border border-gray-500 rounded-md py-1 px-2">
      <ServiceSongUnitEditorHeader index={index} onRemoveUnit={onRemoveUnit} />
      <Tabs defaultValue="empty" className="w-[400px] mt-4">
        <TabsList>
          <TabsTrigger value="edit">{t('Messages.edit')}</TabsTrigger>
          <TabsTrigger value="lyrics">{t('SongData.lyrics')}</TabsTrigger>
          <TabsTrigger value="empty">{t('Messages.hide')}</TabsTrigger>
        </TabsList>
        <TabsContent value="edit">
          <SongUnitListFormContainer index={index} />
        </TabsContent>
        <TabsContent value="lyrics">
          <SongUnitContentView index={index} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
