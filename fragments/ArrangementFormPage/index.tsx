import { PostSongAction } from '@/app/songs/[song]/actions';
import BackArrow from '@/components/BackArrow';
import Header from '@/components/Header';
import Main from '@/components/Main';
import SaveButtonSet from '@/components/SaveButtonSet';
import { SongHook } from '@/hooks/useSong';
import { Dispatch, SetStateAction, useCallback } from 'react';
import ArrangementForm from './ArrangementForm';
import HeaderForm from './HeaderForm';

type ArrangementFormPageProps = {
  songData: SongHook;
  postSong: PostSongAction;
  setWriteMode: Dispatch<SetStateAction<boolean>>;
};

export default function ArrangementFormPage({ songData, postSong, setWriteMode }: ArrangementFormPageProps) {
  const { song, isNewArrangement, title, setTitle, artist, setArtist, songKey, setSongKey } = songData;

  const submitSong = postSong.bind(null, song.serialize() || null);

  const handleSetKey = useCallback(
    (key: string) => {
      setSongKey(key);
    },
    [setSongKey]
  );

  return (
    <form action={submitSong}>
      <Header>
        <BackArrow href="/songs" />
        <HeaderForm
          title={title}
          setTitle={setTitle}
          artist={artist}
          setArtist={setArtist}
          songKey={songKey || ''}
          setSongKey={handleSetKey}
        />
        <SaveButtonSet canCancel={!isNewArrangement} setWriteMode={setWriteMode} />
      </Header>
      <Main className="pt-4">
        <ArrangementForm songData={songData} />
      </Main>
    </form>
  );
}
