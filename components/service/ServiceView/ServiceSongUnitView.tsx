import { useServiceConfig } from "@/components/config/ServiceConfig";
import SongConfigProvider from "@/components/config/SongConfig";
import ArrangementView from "@/components/song/ArrangementView";
import { ClientServiceUnit } from "@/prisma/models";
import { useState } from "react";
import ServiceArrangementHeader from "./ServiceArrangementHeader";
import ServiceSongUnitEditForm from "./ServiceSongUnitEditForm";

type ServiceSongUnitViewProps = {
  unit: ClientServiceUnit;
};

export default function ServiceSongUnitView({ unit }: ServiceSongUnitViewProps) {
  const arrangement = unit.arrangement;
  const { columns, fontSize, mode, density } = useServiceConfig();
  const [isEditing, setIsEditing] = useState(false);

  if (!arrangement) {
    throw new Error("Arrangement is not available for this unit");
  }

  function handleSaved() {
    setIsEditing(false);
  }

  function handleCancel() {
    setIsEditing(false);
  }

  return (
    <div className="w-full">
      <SongConfigProvider
        transpose={unit.semitoneTranspose}
        columns={columns}
        fontSize={fontSize}
        mode={mode}
        density={density}
      >
        <ServiceArrangementHeader
          arrangement={arrangement}
          order={unit.order}
          isEditing={isEditing}
          onToggleEdit={() => setIsEditing((prev) => !prev)}
        />
        {isEditing ? (
          <ServiceSongUnitEditForm
            unit={unit}
            onSaved={handleSaved}
            onCancel={handleCancel}
          />
        ) : (
          <ArrangementView arrangement={arrangement} />
        )}
      </SongConfigProvider>
    </div>
  );
}
