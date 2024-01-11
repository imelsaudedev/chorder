"use client";

import SongForm, { PostSongAction } from "@/fragments/SongForm";
import VersionViewer, { DeleteVersionAction } from "../VersionViewer";
import { Song, getVersionOrDefault } from "@/models/song";
import { useState } from "react";

type SongViewerProps = {
  song: Song | null;
  versionId: number | null;
  initialWriteMode: boolean;
  postSong: PostSongAction;
  deleteVersion: DeleteVersionAction;
};

export default function SongViewer({
  song,
  versionId,
  postSong,
  deleteVersion,
  initialWriteMode,
}: SongViewerProps) {
  const [writeMode, setWriteMode] = useState<boolean>(initialWriteMode);

  const version = getVersionOrDefault(song, versionId);

  if (writeMode)
    return (
      <SongForm
        song={song}
        version={version}
        postSong={postSong}
        setWriteMode={setWriteMode}
      />
    );
  if (song && version)
    return (
      <VersionViewer
        song={song}
        version={version}
        setWriteMode={setWriteMode}
        deleteVersion={deleteVersion}
      />
    );
  return null; // TODO: SHOW ERROR PAGE
}
