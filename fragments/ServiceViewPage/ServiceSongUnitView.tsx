import { ServiceSongUnit } from '@/models/service-unit';
import ArrangementView from '../ArrangementViewPage/ArrangementView';
import { getSongUnitMap } from '@/models/song-arrangement';
import KeyButtonSet from '@/components/KeyButtonSet';
import { useState } from 'react';
import { Mode } from '@/components/ModeButtonSet';
import { NotebookPen } from 'lucide-react';

type ServiceSongUnitViewProps = {
  unit: ServiceSongUnit;
  columns: number;
  mode: Mode;
};

export default function ServiceSongUnitView({ unit, columns, mode }: ServiceSongUnitViewProps) {
  const [transpose, setTranspose] = useState(unit.song.arrangement.semitoneTranspose);
  const arrangement = unit.song.arrangement;

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row gap-2 flex-grow justify-between mt-4 mb-4">
        <div className="flex flex-col md:self-end">
          <h2 className="font-bold text-2xl leading-none tracking-tight text-black mb-1">{unit.song.title}</h2>
          {unit.song.artist && (
            <span className="flex items-center gap-1 text-base text-slate-400">
              <NotebookPen size={16} />
              {unit.song.artist}
            </span>
          )}
        </div>

        <div className="flex gap-2 md:self-end">
          <KeyButtonSet originalKey={arrangement.key || ''} transpose={transpose} setTranspose={setTranspose} />
        </div>
      </div>

      <ArrangementView
        songUnitMap={getSongUnitMap(arrangement)}
        songKey={arrangement.key}
        columns={columns}
        transpose={transpose}
        mode={mode}
      />
    </div>
  );
}
