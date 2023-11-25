import { Unit } from "@/models/unit";
import { unitTypeColorClasses } from "../unit-colors";
import messages from "@/i18n/messages";

export default function UnitCircle({
  unit,
  className,
}: {
  unit: Unit;
  className?: string;
}) {
  const colorClasses = unitTypeColorClasses[unit.type];
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
  const firstLetter = messages.unitTypes[unit.type][0].toUpperCase();
  const number = unit.typeIdx || "";

  return <div className={classList.join(" ")}>{`${firstLetter}${number}`}</div>;
}
