import { UnitType } from "@/models/unit";
import { unitTypeColorClasses } from "../unit-colors";

export default function UnitCircle({
  unitType,
  initial,
  className,
}: {
  unitType: UnitType;
  initial: string;
  className?: string;
}) {
  const colorClasses = unitTypeColorClasses[unitType];
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

  return <div className={classList.join(" ")}>{initial}</div>;
}
