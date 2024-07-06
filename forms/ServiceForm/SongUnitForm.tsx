import { SongUnitSchema } from './schema';

type SongUnitFormProps = {
  unit: SongUnitSchema;
  onRemoveUnit: () => void;
};

export default function SongUnitForm({ unit, onRemoveUnit }: SongUnitFormProps) {
  return <div>{unit.song.currentArrangementId}</div>;
}
