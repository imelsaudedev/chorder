"use client";

import Main from "@components/Main";
import {
  Density,
  useArrangement,
  useColumns,
  useDensity,
  useFontSize,
  useMode,
  useTranspose,
} from "./ArrangementViewContext";
import ColumnViewer from "./ColumnViewer";
import { Skeleton } from "@ui/skeleton";
import { useMediaQuery } from "@hooks/useMediaQuery";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { unitTypeColorClasses } from "@components/unit-colors";

export default function ArrangementViewer() {
  const { arrangement } = useArrangement();
  const { density } = useDensity();
  const { fontSize } = useFontSize();
  const { columns } = useColumns();
  const { transpose } = useTranspose();
  const { mode } = useMode();

  if (!arrangement) {
    return <ArrangementViewerSkeleton density={density} />;
  }

  return (
    <Main density={density} className="py-4 sm:py-6 lg:py-8">
      <div style={{ fontSize: `${fontSize}px` }}>
        <ColumnViewer
          columns={columns}
          songUnits={arrangement.units}
          transpose={transpose}
          originalKey={arrangement.key}
          mode={mode}
          density={density}
        />
      </div>
    </Main>
  );
}

type ArrangementViewerSkeletonProps = {
  density: Density;
};

function ArrangementViewerSkeleton({
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
    <Main density={density} className="py-4 sm:py-6 lg:py-8">
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
              unitTypeColorClasses[unit].border,
              unitTypeColorClasses[unit].background
            )}
          />
        ))}
      </div>
    </Main>
  );
}
