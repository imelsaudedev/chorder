import { Density } from "@/components/config/config";
import { unitColorClasses } from "@/components/song/unit-colors";
import { Skeleton } from "@/components/ui/skeleton";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import clsx from "clsx";
import { useEffect, useState } from "react";

type ArrangementViewerSkeletonProps = {
  density: Density;
};
export default function ArrangementViewerSkeleton({
  density,
}: ArrangementViewerSkeletonProps) {
  const [columns, setColumns] = useState(1);

  const isPhone = useMediaQuery("(max-width: 639px)");
  const isTablet = useMediaQuery("(max-width: 1023px)");
  const isDesktop = useMediaQuery("(max-width: 1279px)");

  useEffect(() => {
    if (isPhone) {
      setColumns(1);
    } else if (isTablet) {
      setColumns(2);
    } else if (isDesktop) {
      setColumns(3);
    } else {
      setColumns(4);
    }
  }, [isDesktop, isPhone, isTablet]);

  const gridCols =
    columns === 2
      ? "grid-cols-2"
      : columns === 3
      ? "grid-cols-3"
      : columns >= 4
      ? "grid-cols-4"
      : "grid-cols-1";

  const skeletons = [
    "INTRO",
    "VERSE",
    "VERSE",
    "CHORUS",
    "BRIDGE",
    "VERSE",
    "VERSE",
    "CHORUS",
    "SOLO",
    "VERSE",
    "CHORUS",
    "ENDING",
  ] as const;

  return (
    <div
      className={`grid ${gridCols} ${
        density === "compact" ? "gap-2" : "gap-4"
      }`}
    >
      {skeletons.map((unit, index) => (
        <Skeleton
          key={index}
          className={clsx(
            "h-12 w-full border",
            unitColorClasses[unit].border,
            unitColorClasses[unit].background
          )}
        />
      ))}
    </div>
  );
}
