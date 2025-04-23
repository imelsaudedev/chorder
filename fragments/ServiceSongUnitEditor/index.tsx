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
    <div className="grow bg-zinc-50 border border-zinc-200 rounded-md sm:rounded-lg p-2 sm:p-4 ">
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
