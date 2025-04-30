"use client";

import Main from "@components/Main";
import {
  useArrangement,
  useColumns,
  useDensity,
  useFontSize,
  useMode,
  useTranspose,
} from "./ArrangementViewContext";
import ColumnViewer from "./ColumnViewer";

export default function ArrangementViewer() {
  const { arrangement } = useArrangement();
  const { density } = useDensity();
  const { fontSize } = useFontSize();
  const { columns } = useColumns();
  const { transpose } = useTranspose();
  const { mode } = useMode();

  if (!arrangement) {
    return null;
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
