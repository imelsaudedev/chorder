import { SongUnit } from '@/models/song-unit';
import { unitTypeColorClasses } from '../unit-colors';
import { useTranslations } from 'next-intl';

export default function UnitCircle({ unit, className }: { unit: SongUnit; className?: string }) {
  const t = useTranslations('UnitTypes');
  const colorClasses = unitTypeColorClasses[unit.type];
  const classList = [
    'h-8',
    'w-8',
    'flex',
    'items-center',
    'justify-center',
    'rounded-full',
    colorClasses.circleBackground,
    colorClasses.text,
  ];
  if (className) {
    classList.push(className);
  }
  const firstLetter = t(unit.type)[0].toUpperCase();
  const number = unit.typeIdx || '';

  return <div className={classList.join(' ')}>{`${firstLetter}${number}`}</div>;
}
