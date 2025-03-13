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
import { NotebookPen } from 'lucide-react';

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
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-2 flex-grow justify-between mt-4 mb-4">
          <div className="flex flex-col">
            <h1 className="font-bold text-4xl leading-none tracking-tight text-primary mb-2">{song.title}</h1>
            {song.artist && (
              <span className="flex items-center gap-1 text-lg text-slate-400">
                <NotebookPen size={18} />
                {song.artist}
              </span>
            )}
          </div>
          <div className="flex gap-2 md:self-end">
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
