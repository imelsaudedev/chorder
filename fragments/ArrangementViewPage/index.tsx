import { DeleteArrangementAction } from '@/app/songs/[song]/actions';
import ArrangementSelector from '@/components/ArrangementSelector';
import Main from '@/components/Main';
import { Mode } from '@/components/ModeButtonSet';
import AdjustmentIcon from '@/components/icons/AdjustmentIcon';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { RequiredArrangement, SongWith } from '@/models/song';
import { getSongUnitMap } from '@/models/song-arrangement';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import ArrangementView from './ArrangementView';
import SongConfig from './SongConfig';
import ArrangementActionMenu from './ArrangementActionMenu';

type ArrangementViewPageProps = {
  song: SongWith<RequiredArrangement>;
  deleteArrangement: DeleteArrangementAction;
};

export default function ArrangementViewPage({ song, deleteArrangement }: ArrangementViewPageProps) {
  const t = useTranslations('Messages');
  const [transpose, setTranspose] = useState(0);
  const [columns, setColumns] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [mode, setMode] = useState('chords' as Mode);

  const deleteArrangementWithId = deleteArrangement.bind(null, song, song.currentArrangementId);
  const arrangement = song.arrangement;
  const songUnitMap = useMemo(() => getSongUnitMap(arrangement), [arrangement]);

  return (
    <Collapsible>
      <div className="px-4">
        <div className="flex flex-grow flex-col md:flex-row justify-between md:items-center gap-2">
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-none text-red">{song.title}</span>
            {song.artist && <span className="text-sm text-muted">{song.artist}</span>}
          </div>
          <div className="flex items-center gap-2">
            <ArrangementSelector song={song} />
            <ArrangementActionMenu deleteArrangementWithId={deleteArrangementWithId} />
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="w-9 p-0">
                <AdjustmentIcon />
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
            mode={mode}
            setMode={setMode}
            originalKey={arrangement.key || ''}
            transpose={transpose}
            setTranspose={setTranspose}
          />
        </CollapsibleContent>
        <div style={{ fontSize: `${fontSize}px` }}>
          <ArrangementView
            columns={columns}
            songUnitMap={songUnitMap}
            transpose={transpose}
            songKey={arrangement.key}
            mode={mode}
          />
        </div>
      </Main>
    </Collapsible>
  );
}
