import { SongUnitType, SongUnitTypes } from "@/prisma/models";
import { unitTypeColorClasses } from "@components/unit-colors";
import { useTranslations } from "next-intl";

type BadgeSelectorProps = {
  value: SongUnitType;
  onChange: (value: SongUnitType) => void;
};

export default function BadgeSelector({ value, onChange }: BadgeSelectorProps) {
  const t = useTranslations();

  return (
    <div className="flex gap-2 flex-wrap">
      {Object(SongUnitTypes)
        .keys()
        .map((type: SongUnitType) => {
          const colorClasses = unitTypeColorClasses[type];

          return (
            <button
              key={type}
              onClick={(e) => {
                e.preventDefault();
                onChange(type);
              }}
              className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium
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
