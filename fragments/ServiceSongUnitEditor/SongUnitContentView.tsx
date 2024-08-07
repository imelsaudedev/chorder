import { getLyrics } from '@/chopro/music';
import { ServiceFormSchema } from '@/forms/ServiceForm/schema';
import { getInternalId2Unit } from '@/models/song-arrangement';
import { Fragment, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

type SongUnitContentViewProps = { index: number };

export default function SongUnitContentView({ index }: SongUnitContentViewProps) {
  const { getValues } = useFormContext<ServiceFormSchema>();
  const units = getValues(`units.${index}.units`);
  const songMap = getValues(`units.${index}.songMap`);
  const songUnitMap = useMemo(() => {
    const internalId2Unit = getInternalId2Unit(units);
    return songMap.map(({ internalId }) => internalId2Unit.get(internalId));
  }, [songMap, units]);

  return (
    <div className="columns-xs mt-4">
      {songUnitMap
        .map((unit) => getLyrics(unit?.content || ''))
        .filter((verse) => (verse?.length || 0) > 0)
        .map((verse, verseIdx) => (
          <Fragment key={verseIdx}>
            {verse!.split('\n').map((line, lineIdx) => (
              <p key={lineIdx}>{line}</p>
            ))}
            <p className="h-2"></p>
          </Fragment>
        ))}
    </div>
  );
}
