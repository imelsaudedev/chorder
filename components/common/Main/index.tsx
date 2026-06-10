import { Density } from "@/components/config/config";

export default function Main({
  className,
  density = "normal",
  children,
}: {
  className?: string;
  density?: Density;
  children?: React.ReactNode;
}) {
  const densityClasses = {
    compact: "px-2 sm:px-2 lg:px-4",
    normal: "px-5 sm:px-8 lg:px-14",
  };

  const classNames = ["mb-12", densityClasses[density]];
  if (className) {
    classNames.push(className);
  }

  return <main className={classNames.join(" ")}>{children}</main>;
}
