'use client';

import ArrangementFormPage from '@/fragments/ArrangementFormPage';
import ArrangementViewPage from '../ArrangementViewPage';
import { useMemo, useState } from 'react';
import { SerializedSong, Song } from '@/models/song';
import { DeleteArrangementAction, PostSongAction } from '@/app/songs/[song]/actions';
import useSong from '@/hooks/useSong';

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
  const song = useMemo(() => Song.deserialize(serializedSong), [serializedSong]);
  const songData = useSong(song, arrangementId || song.defaultArrangementId);
  const [writeMode, setWriteMode] = useState<boolean>(initialWriteMode);

  if (writeMode)
    return (
      <ArrangementFormPage
        songData={songData}
        postSong={postSong}
        setWriteMode={(newWriteMode) => {
          setWriteMode(newWriteMode);
        }}
      />
    );
  else
    return (
      <ArrangementViewPage songData={songData} setWriteMode={setWriteMode} deleteArrangement={deleteArrangement} />
    );
}
