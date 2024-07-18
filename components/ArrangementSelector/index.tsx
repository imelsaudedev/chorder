import { RequiredArrangement, SongWith } from '@/models/song';
import { ComboBoxResponsive } from '../ComboBoxResponsive';
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import useUpdateParams from '@/hooks/useUpdateParams';

type ArrangementSelectorProps = {
  song: SongWith<RequiredArrangement>;
};

export default function ArrangementSelector({ song }: ArrangementSelectorProps) {
  const t = useTranslations('Messages');

  const arrangement = song.arrangement;
  const updateParams = useUpdateParams();

  const arrangementOptions = useMemo(() => {
    return song.arrangements.map((arrangement, idx) => ({
      label: `${t('arrangement')} ${idx + 1}`, // TODO use arrangement name
      value: `${idx}`,
    }));
  }, [song.arrangements, t]);
  const handleChangeArrangement = (arrangementIdxStr: string) => {
    const arrangementIdx = parseInt(arrangementIdxStr);
    if (arrangementIdx !== song.currentArrangementId) {
      updateParams('arr', `${arrangementIdx}`);
    }
  };

  return (
    <ComboBoxResponsive
      value={`${song.currentArrangementId}`}
      options={arrangementOptions}
      placeholder={t('arrangement')}
      onChange={handleChangeArrangement}
      hideCurrentValue={true}
    />
  );
}
