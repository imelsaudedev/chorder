'use client';

import { DeleteArrangementAction, PostSongAction } from '@/app/songs/[song]/actions';
import Main from '@/components/Main';
import ArrangementForm from '@/forms/ArrangementForm';
import { RequiredArrangement, SongWith } from '@/models/song';
import { RequiredIsNew, SongArrangementWith } from '@/models/song-arrangement';
import { useState } from 'react';
import ArrangementViewPage from '../ArrangementViewPage';

type SongViewerProps = {
  song: SongWith<RequiredArrangement<SongArrangementWith<RequiredIsNew>>>;
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
      {!writeMode && (
        <ArrangementViewPage song={song} setWriteMode={setWriteMode} deleteArrangement={deleteArrangement} />
      )}
    </>
  );
}
