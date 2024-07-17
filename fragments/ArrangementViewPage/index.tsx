import { DeleteArrangementAction } from '@/app/songs/[song]/actions';
import KeyButtonSet from '@/components/KeyButtonSet';
import Main from '@/components/Main';
import ConfigIcon from '@/components/icons/ConfigIcon';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { RequiredArrangement, SongWith } from '@/models/song';
import { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react';
import ArrangementView from './ArrangementView';
import SongConfig from './SongConfig';
import { getSongUnitMap } from '@/models/song-arrangement';
import { useTranslations } from 'next-intl';

type ArrangementViewPageProps = {
  song: SongWith<RequiredArrangement>;
  setWriteMode: Dispatch<SetStateAction<boolean>>;
  deleteArrangement: DeleteArrangementAction;
};

export default function ArrangementViewPage({ song, setWriteMode, deleteArrangement }: ArrangementViewPageProps) {
  const t = useTranslations('Messages');
  const [transpose, setTranspose] = useState(0);
  const [columns, setColumns] = useState(0);
  const [fontSize, setFontSize] = useState(16);

  const handleEditButtonClick = useCallback(() => {
    setWriteMode(true);
  }, [setWriteMode]);

  // TODO: MAYBE WE NEED A CONFIRMATION DIALOG FOR THIS?
  const deleteArrangementWithId = deleteArrangement.bind(null, song, song.currentArrangementId);
  const arrangement = song.arrangement;
  const songUnitMap = useMemo(() => getSongUnitMap(arrangement), [arrangement]);

  return (
    <Collapsible>
      <div className="px-4">
        <div className="flex gap-2 flex-grow justify-between items-center">
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-none text-primary">{song.title}</span>
            {song.artist && <span className="text-sm text-muted">{song.artist}</span>}
          </div>
          <div className="flex gap-2">
            <KeyButtonSet originalKey={arrangement.key || ''} transpose={transpose} setTranspose={setTranspose} />
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-9 p-0">
                <ConfigIcon />
                <span className="sr-only">{t('toggleConfig')}</span>
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>
      </div>
      <Main>
        <CollapsibleContent>
          <SongConfig
            columns={columns}
            setColumns={setColumns}
            fontSize={fontSize}
            setFontSize={setFontSize}
            deleteArrangementWithId={deleteArrangementWithId}
            onEditButtonClick={handleEditButtonClick}
          />
        </CollapsibleContent>
        <div style={{ fontSize: `${fontSize}px` }}>
          <ArrangementView
            columns={columns}
            songUnitMap={songUnitMap}
            transpose={transpose}
            songKey={arrangement.key}
          />
        </div>
      </Main>
    </Collapsible>
  );
}
