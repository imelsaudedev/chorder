import { unitColorClasses } from "@/components/song/unit-colors";
import { SONG_UNIT_TYPES, SongUnitType } from "@/prisma/models";
import { useTranslations } from "next-intl";

type BadgeSelectorProps = {
  value: SongUnitType;
  onChange: (value: SongUnitType) => void;
};

export default function BadgeSelector({ value, onChange }: BadgeSelectorProps) {
  const t = useTranslations();

  return (
    <div className="inline-flex flex-wrap gap-[1px] rounded bg-zinc-200 p-[1px]">
      {SONG_UNIT_TYPES.map((type) => {
        const colorClasses = unitColorClasses[type];

        return (
          <button
            key={type}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onChange(type);
            }}
            className={`text-xs px-2 py-1 font-medium transition-colors rounded-sm cursor-pointer
              ${
                type === value
                  ? `${colorClasses.circleBackground} text-white`
                  : "bg-white text-zinc-600 hover:bg-zinc-100"
              }`}
          >
            {t(`UnitTypes.${type}`)}
          </button>
        );
      })}
    </div>
  );
}
