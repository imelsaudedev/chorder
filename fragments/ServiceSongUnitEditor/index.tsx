import SongUnitListForm from '@/forms/ArrangementForm/SongUnitListForm';
import { SongUnitSchema } from '@/forms/ServiceForm/schema';
import { MouseEventHandler, useCallback, useState } from 'react';
import ServiceSongUnitEditorHeader from './ServiceSongUnitEditorHeader';
import SongUnitContentView from './SongUnitContentView';
import SongUnitListFormContainer from './SongUnitListFormContainer';

type ServiceSongUnitEditorProps = {
  index: number;
  onRemoveUnit: () => void;
};

export default function ServiceSongUnitEditor({ index, onRemoveUnit }: ServiceSongUnitEditorProps) {
  const [editMode, setEditMode] = useState(false);

  const handleToggleEditMode: MouseEventHandler = useCallback((event) => {
    event.preventDefault();
    setEditMode((prev) => !prev);
  }, []);

  return (
    <div className="flex-grow border border-gray-500 rounded-md py-1 px-2">
      <ServiceSongUnitEditorHeader index={index} onToggleEditMode={handleToggleEditMode} onRemoveUnit={onRemoveUnit} />
      <div className="mt-8">
        {editMode && <SongUnitListFormContainer index={index} />}
        {!editMode && <SongUnitContentView index={index} />}
      </div>
    </div>
  );
}
