import { ServiceSongUnit } from '@/models/service-unit';
import ArrangementView from '../ArrangementViewPage/ArrangementView';
import { getSongUnitMap } from '@/models/song-arrangement';
import KeyButtonSet from '@/components/KeyButtonSet';
import { useState } from 'react';

type ServiceSongUnitViewProps = {
  unit: ServiceSongUnit;
  columns: number;
};

export default function ServiceSongUnitView({ unit, columns }: ServiceSongUnitViewProps) {
  const [transpose, setTranspose] = useState(unit.song.arrangement.semitoneTranspose);
  const arrangement = unit.song.arrangement;
  return (
    <div className="w-full">
      <div className="flex gap-2 flex-grow justify-between items-center mb-2">
        <div className="flex flex-col">
          <h2 className="font-bold text-[1.125em] leading-none text-primary">{unit.song.title}</h2>
          {unit.song.artist && <span className="text-[0.875em] text-muted">{unit.song.artist}</span>}
        </div>
        <div className="flex gap-2">
          <KeyButtonSet originalKey={arrangement.key || ''} transpose={transpose} setTranspose={setTranspose} />
        </div>
      </div>

      <ArrangementView
        songUnitMap={getSongUnitMap(arrangement)}
        songKey={arrangement.key}
        columns={columns}
        transpose={transpose}
      />
    </div>
  );
}
