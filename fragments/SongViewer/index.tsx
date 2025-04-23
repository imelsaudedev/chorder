'use client';

import { DeleteArrangementAction, MoveArrangementAction, PostSongAction } from '@/app/(main)/songs/[song]/actions';
import Main from '@/components/Main';
import ArrangementForm from '@/forms/ArrangementForm';
import { NewSong, RequiredArrangement, SongWith } from '@/models/song';
import ArrangementViewPage from '../ArrangementViewPage';

type SongViewerProps = {
  song: NewSong;
  writeMode: boolean;
  postSong: PostSongAction;
  deleteArrangement: DeleteArrangementAction;
  moveArrangement: MoveArrangementAction;
};

export default function SongViewer({ song, postSong, deleteArrangement, moveArrangement, writeMode }: SongViewerProps) {
  if (writeMode) {
    return <ArrangementForm song={song} postSong={postSong} moveArrangement={moveArrangement} />;
  } else if (song.slug) {
    return <ArrangementViewPage song={song as SongWith<RequiredArrangement>} deleteArrangement={deleteArrangement} />;
  }
}
