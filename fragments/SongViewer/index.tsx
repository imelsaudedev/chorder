'use client';

import { DeleteArrangementAction, PostSongAction } from '@/app/songs/[song]/actions';
import Main from '@/components/Main';
import ArrangementForm from '@/forms/ArrangementForm';
import { NewSong, RequiredArrangement, SongWith } from '@/models/song';
import ArrangementViewPage from '../ArrangementViewPage';

type SongViewerProps = {
  song: NewSong;
  writeMode: boolean;
  postSong: PostSongAction;
  deleteArrangement: DeleteArrangementAction;
};

export default function SongViewer({ song, postSong, deleteArrangement, writeMode }: SongViewerProps) {
  if (writeMode) {
    return (
      <Main>
        <ArrangementForm song={song} postSong={postSong} />
      </Main>
    );
  } else if (song.slug) {
    return <ArrangementViewPage song={song as SongWith<RequiredArrangement>} deleteArrangement={deleteArrangement} />;
  }
}
