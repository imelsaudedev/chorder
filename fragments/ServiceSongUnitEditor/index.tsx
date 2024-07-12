import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import messages from '@/i18n/messages';
import { MouseEventHandler, useCallback, useState } from 'react';
import ServiceSongUnitEditorHeader from './ServiceSongUnitEditorHeader';
import SongUnitContentView from './SongUnitContentView';
import SongUnitListFormContainer from './SongUnitListFormContainer';

type ServiceSongUnitEditorProps = {
  index: number;
  onRemoveUnit: () => void;
};

export default function ServiceSongUnitEditor({ index, onRemoveUnit }: ServiceSongUnitEditorProps) {
  return (
    <div className="flex-grow border border-gray-500 rounded-md py-1 px-2">
      <ServiceSongUnitEditorHeader index={index} onRemoveUnit={onRemoveUnit} />
      <Tabs defaultValue="empty" className="w-[400px] mt-4">
        <TabsList>
          <TabsTrigger value="edit">{messages.messages.edit}</TabsTrigger>
          <TabsTrigger value="lyrics">{messages.songData.lyrics}</TabsTrigger>
          <TabsTrigger value="empty">{messages.messages.hide}</TabsTrigger>
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
