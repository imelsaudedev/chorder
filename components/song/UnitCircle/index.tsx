import { SongUnitType } from "@/prisma/models";
import { useTranslations } from "next-intl";
import { unitColorClasses } from "../unit-colors";

export default function UnitCircle({
  unitType,
  typeIdx,
  className,
}: {
  unitType: SongUnitType;
  typeIdx: number;
  className?: string;
}) {
  const t = useTranslations("UnitTypes");
  const colorClasses = unitColorClasses[unitType];
  const classList = [
    "h-8",
    "w-8",
    "flex",
    "items-center",
    "justify-center",
    "rounded-full",
    colorClasses.circleBackground,
    colorClasses.text,
  ];
  if (className) {
    classList.push(className);
  }
  const firstLetter = t(unitType)[0].toUpperCase();
  const number = typeIdx || "";

  return <div className={classList.join(" ")}>{`${firstLetter}${number}`}</div>;
}
