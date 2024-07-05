'use client';

import { DeleteArrangementAction, PostSongAction } from '@/app/songs/[song]/actions';
import ArrangementFormPage from '@/fragments/ArrangementFormPage';
import { SerializedSong, Song } from '@/models/song';
import { useEffect, useRef, useState } from 'react';
import ArrangementViewPage from '../ArrangementViewPage';
import Main from '@/components/Main';
import ArrangementForm from '@/forms/ArrangementForm';

type SongViewerProps = {
  song: SerializedSong;
  arrangementId: number | null;
  initialWriteMode: boolean;
  postSong: PostSongAction;
  deleteArrangement: DeleteArrangementAction;
};

export default function SongViewer({
  song: serializedSong,
  arrangementId,
  postSong,
  deleteArrangement,
  initialWriteMode,
}: SongViewerProps) {
  const songRef = useRef(Song.deserialize(serializedSong));
  const song = songRef.current;

  useEffect(() => {
    if (arrangementId === null) {
      if (song.arrangements.length === 0) {
        song.createArrangement();
      }
    } else {
      song.currentArrangementId = arrangementId;
    }
  }, [arrangementId, song]);
  const [writeMode, setWriteMode] = useState<boolean>(initialWriteMode);

  return (
    <>
      {writeMode && (
        <Main>
          <ArrangementForm
            song={song}
            postSong={postSong}
            setWriteMode={(newWriteMode) => {
              setWriteMode(newWriteMode);
            }}
          />
        </Main>
      )}
      {!writeMode && (
        <ArrangementViewPage song={song} setWriteMode={setWriteMode} deleteArrangement={deleteArrangement} />
      )}
    </>
  );
}
