import { ServiceSongUnit } from '@/models/service-unit';
import ArrangementView from '../ArrangementViewPage/ArrangementView';
import { getSongUnitMap } from '@/models/song-arrangement';

type ServiceSongUnitViewProps = {
  unit: ServiceSongUnit;
  columns: number;
};

export default function ServiceSongUnitView({ unit, columns }: ServiceSongUnitViewProps) {
  const arrangement = unit.song.arrangement;
  return (
    <div className="w-full">
      <h2 className="font-bold text-lg leading-none">{unit.song.title}</h2>
      {unit.song.artist && <span className="text-sm text-gray-400 leading-tight mb-1">{unit.song.artist}</span>}
      <ArrangementView
        songUnitMap={getSongUnitMap(arrangement)}
        songKey={arrangement.key}
        columns={columns}
        transpose={unit.song.arrangement.semitoneTranspose}
      />
    </div>
  );
}
