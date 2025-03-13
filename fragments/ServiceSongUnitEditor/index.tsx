import { useState } from 'react';
import ServiceSongUnitEditorHeader from './ServiceSongUnitEditorHeader';
import SongUnitContentView from './SongUnitContentView';
import SongUnitListFormContainer from './SongUnitListFormContainer';

type ServiceSongUnitEditorProps = {
  index: number;
  onRemoveUnit: () => void;
};

export default function ServiceSongUnitEditor({ index, onRemoveUnit }: ServiceSongUnitEditorProps) {
  const [editArrangement, setEditArrangement] = useState(false);

  return (
    <div className="flex-grow border border-slate-300 rounded-lg p-4">
      <ServiceSongUnitEditorHeader
        index={index}
        onRemoveUnit={onRemoveUnit}
        onToggleEdit={() => setEditArrangement((prev) => !prev)}
        isEditing={editArrangement}
      />

      {editArrangement && <SongUnitListFormContainer index={index} />}
    </div>
  );
}
