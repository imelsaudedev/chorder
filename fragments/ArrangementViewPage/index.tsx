import { DeleteArrangementAction } from '@/app/songs/[song]/actions';
import BackArrow from '@/components/BackArrow';
import Header from '@/components/Header';
import KeyButtonSet from '@/components/KeyButtonSet';
import Main from '@/components/Main';
import ConfigIcon from '@/components/icons/ConfigIcon';
import { Button } from '@/components/ui/button';
import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import ArrangementView from './ArrangementView';
import SongConfig from './SongConfig';
import { Song } from '@/models/song';

type ArrangementViewPageProps = {
  song: Song;
  setWriteMode: Dispatch<SetStateAction<boolean>>;
  deleteArrangement: DeleteArrangementAction;
};

export default function ArrangementViewPage({ song, setWriteMode, deleteArrangement }: ArrangementViewPageProps) {
  const [transpose, setTranspose] = useState(0);
  const [columns, setColumns] = useState(1);
  const [showConfig, setShowConfig] = useState(false);

  const handleToggleConfig = useCallback(() => {
    setShowConfig((prev) => !prev);
  }, [setShowConfig]);

  const handleEditButtonClick = useCallback(() => {
    setWriteMode(true);
  }, [setWriteMode]);

  // TODO: MAYBE WE NEED A CONFIRMATION DIALOG FOR THIS?
  const deleteArrangementWithId = deleteArrangement.bind(null, song.serialize(), song.currentArrangementId);
  const arrangement = song.getOrCreateCurrentArrangement();

  return (
    <>
      <Header>
        <BackArrow href="/songs" />
        <div className="flex ml-4 gap-2 flex-grow justify-between items-center">
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-none">{song.title}</span>
            {song.artist && <span className="text-sm">{song.artist}</span>}
          </div>
          <div className="flex gap-2">
            <KeyButtonSet originalKey={arrangement.key || ''} transpose={transpose} setTranspose={setTranspose} />
            <Button variant="outline" onClick={handleToggleConfig}>
              <ConfigIcon />
            </Button>
          </div>
        </div>
      </Header>
      <Main className="pt-4">
        <SongConfig
          columns={columns}
          setColumns={setColumns}
          deleteArrangementWithId={deleteArrangementWithId}
          onEditButtonClick={handleEditButtonClick}
          visible={showConfig}
        />
        <ArrangementView
          columns={columns}
          songUnitMap={arrangement.songUnitMap}
          transpose={transpose}
          songKey={arrangement.key}
        />
      </Main>
    </>
  );
}
