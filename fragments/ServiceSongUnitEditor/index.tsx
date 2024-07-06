import { ServiceSongUnit } from '@/models/service-unit';
import { MouseEventHandler, useCallback, useState } from 'react';
import ServiceSongUnitEditorHeader from './ServiceSongUnitEditorHeader';
import SongUnitContentView from './SongUnitContentView';
import SongUnitListForm from '@/forms/ArrangementForm/SongUnitListForm';

type ServiceSongUnitEditorProps = {
  unit: ServiceSongUnit;
  updateSong: () => void;
  setSemitoneTranspose: (semitones: number) => void;
  removeUnit: () => void;
};

export default function ServiceSongUnitEditor({
  unit,
  updateSong,
  setSemitoneTranspose,
  removeUnit,
}: ServiceSongUnitEditorProps) {
  const song = unit.song;
  const arrangement = song.arrangement;

  const [editMode, setEditMode] = useState(false);

  const handleToggleEditMode: MouseEventHandler = useCallback((event) => {
    event.preventDefault();
    setEditMode((prev) => !prev);
  }, []);

  return (
    <div className="flex-grow border border-gray-500 rounded-md py-1 px-2">
      <ServiceSongUnitEditorHeader
        song={song}
        arrangement={arrangement}
        setSemitoneTranspose={setSemitoneTranspose}
        onToggleEditMode={handleToggleEditMode}
        removeUnit={removeUnit}
      />
      <div className="mt-8">
        {editMode && <SongUnitListForm arrangement={arrangement} updateSong={updateSong} />}
        {!editMode && <SongUnitContentView arrangement={arrangement} />}
      </div>
    </div>
  );
}
