"use client";

import SongForm, { PostSongAction } from "@/fragments/SongForm";
import ArrangementViewer, { DeleteArrangementAction } from "../ArrangementViewer";
import { Song, getArrangementOrDefault } from "@/models/song";
import { useState } from "react";

type SongViewerProps = {
  song: Song | null;
  arrangementId: number | null;
  initialWriteMode: boolean;
  postSong: PostSongAction;
  deleteArrangement: DeleteArrangementAction;
};

export default function SongViewer({
  song,
  arrangementId,
  postSong,
  deleteArrangement,
  initialWriteMode,
}: SongViewerProps) {
  const [writeMode, setWriteMode] = useState<boolean>(initialWriteMode);

  const arrangement = getArrangementOrDefault(song, arrangementId);

  if (writeMode)
    return (
      <SongForm
        song={song}
        arrangement={arrangement}
        postSong={postSong}
        setWriteMode={setWriteMode}
      />
    );
  if (song && arrangement)
    return (
      <ArrangementViewer
        song={song}
        arrangement={arrangement}
        setWriteMode={setWriteMode}
        deleteArrangement={deleteArrangement}
      />
    );
  return null; // TODO: SHOW ERROR PAGE
}
