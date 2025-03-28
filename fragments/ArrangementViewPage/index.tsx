import PageHeader from '@/components/PageHeader';
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
import { NotebookPen, ArrowLeft, Music } from 'lucide-react';
import Link from 'next/link';

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
  const [density, setDensity] = useState<'compact' | 'normal'>('normal');

  const deleteArrangementWithId = deleteArrangement.bind(null, song, song.currentArrangementId);
  const arrangement = song.arrangement;
  const songUnitMap = useMemo(() => getSongUnitMap(arrangement), [arrangement]);

  const subtitle = song.artist ? (
    <span className="flex items-center gap-1">
      <NotebookPen className="w-4 h-4" />
      {song.artist}
    </span>
  ) : null;

  return (
    <Collapsible>
      <PageHeader
        backLinkHref="/songs"
        backLinkText="Músicas"
        title={song.title}
        subtitle={subtitle}
        actions={
          <div className="flex gap-2 md:self-end">
            <ArrangementSelector song={song} />
            <ArrangementActionMenu deleteArrangementWithId={deleteArrangementWithId} />
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="icon">
                <AdjustmentIcon />
                <span className="sr-only">{t('toggleConfig')}</span>
              </Button>
            </CollapsibleTrigger>
          </div>
        }
      />

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
          density={density}
          setDensity={setDensity}
        />
      </CollapsibleContent>

      <Main density={density} className="py-4 sm:py-6 lg:py-8">
        <div style={{ fontSize: `${fontSize}px` }}>
          <ArrangementView
            columns={columns}
            songUnitMap={songUnitMap}
            transpose={transpose}
            songKey={arrangement.key}
            mode={mode}
            density={density}
          />
        </div>
      </Main>
    </Collapsible>
  );
}
