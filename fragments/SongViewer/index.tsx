'use client';

import { DeleteArrangementAction, PostSongAction } from '@/app/songs/[song]/actions';
import Main from '@/components/Main';
import ArrangementForm from '@/forms/ArrangementForm';
import { NewSong, RequiredArrangement, SongWith } from '@/models/song';
import { useState } from 'react';
import ArrangementViewPage from '../ArrangementViewPage';

type SongViewerProps = {
  song: NewSong;
  initialWriteMode: boolean;
  postSong: PostSongAction;
  deleteArrangement: DeleteArrangementAction;
};

export default function SongViewer({ song, postSong, deleteArrangement, initialWriteMode }: SongViewerProps) {
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
      {!writeMode && song.slug && (
        <ArrangementViewPage
          song={song as SongWith<RequiredArrangement>}
          setWriteMode={setWriteMode}
          deleteArrangement={deleteArrangement}
        />
      )}
    </>
  );
}
