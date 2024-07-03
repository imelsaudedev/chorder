import { PostSongAction } from '@/app/songs/[song]/actions';
import BackArrow from '@/components/BackArrow';
import Header from '@/components/Header';
import Main from '@/components/Main';
import SaveButtonSet from '@/components/SaveButtonSet';
import { Song } from '@/models/song';
import { Dispatch, SetStateAction, useState } from 'react';
import ArrangementForm from './ArrangementForm';
import HeaderForm from './HeaderForm';

type ArrangementFormPageProps = {
  song: Song;
  postSong: PostSongAction;
  setWriteMode: Dispatch<SetStateAction<boolean>>;
};

export default function ArrangementFormPage({ song, postSong, setWriteMode }: ArrangementFormPageProps) {
  const arrangement = song.getOrCreateCurrentArrangement();
  const [serializedSong, setSerializedSong] = useState(song.serialize());
  const submitSong = postSong.bind(null, serializedSong);
  const updateSong = () => {
    setSerializedSong(song.serialize());
  };

  return (
    <form action={submitSong}>
      <Header>
        <BackArrow href="/songs" />
        <HeaderForm song={song} updateSong={updateSong} />
        <SaveButtonSet canCancel={!arrangement.isNew} setWriteMode={setWriteMode} enabled={song.isValid} />
      </Header>
      <Main className="pt-4">
        <ArrangementForm arrangement={arrangement} updateSong={updateSong} />
      </Main>
    </form>
  );
}
