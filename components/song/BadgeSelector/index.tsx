import { unitColorClasses } from "@/components/song/unit-colors";
import { SONG_UNIT_TYPES, SongUnitType } from "@/models/song-unit";
import { useTranslations } from "next-intl";

type BadgeSelectorProps = {
  value: SongUnitType;
  onChange: (value: SongUnitType) => void;
};

export default function BadgeSelector({ value, onChange }: BadgeSelectorProps) {
  const t = useTranslations();

  return (
    <div className="flex gap-2 flex-wrap">
      {SONG_UNIT_TYPES.map((type) => {
        const colorClasses = unitColorClasses[type];

        return (
          <button
            key={type}
            onClick={(e) => {
              e.preventDefault();
              onChange(type);
            }}
            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium cursor-pointer
              ${
                type === value
                  ? `${colorClasses.circleBackground} text-white` // Fundo da unit e texto branco
                  : "bg-transparent text-primary border border-gray-300 border-dotted" // Fundo branco e texto cinza
              }`}
          >
            {t(`UnitTypes.${type}`)}
          </button>
        );
      })}
    </div>
  );
}
