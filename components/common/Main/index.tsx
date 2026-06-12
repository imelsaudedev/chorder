import { Density } from "@/components/config/config";
import { cn } from "@/lib/utils";

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

  return (
    <main className={cn("mb-12", densityClasses[density], className)}>
      {children}
    </main>
  );
}
