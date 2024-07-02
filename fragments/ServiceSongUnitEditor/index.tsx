import useSong from '@/hooks/useSong';
import { ServiceSongUnit } from '@/models/service';
import { MouseEventHandler, useCallback, useEffect, useMemo, useState } from 'react';
import ArrangementForm from '../ArrangementFormPage/ArrangementForm';
import ServiceSongUnitEditorHeader from './ServiceSongUnitEditorHeader';
import SongUnitContentView from './SongUnitContentView';
import { Song } from '@/models/song';

type ServiceSongUnitEditorProps = {
  unit: ServiceSongUnit;
  updateSong: (song: Song) => void;
  setSemitoneTranspose: (semitones: number) => void;
  removeUnit: () => void;
};

export default function ServiceSongUnitEditor({
  unit,
  updateSong,
  setSemitoneTranspose,
  removeUnit,
}: ServiceSongUnitEditorProps) {
  const songData = useSong(unit.song, unit.arrangementId);
  const { song, arrangementIndex } = songData;
  const arrangement = song.arrangements[arrangementIndex];

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
      {editMode && <ArrangementForm songData={songData} />}
      {!editMode && <SongUnitContentView arrangement={arrangement} />}
    </div>
  );
}
