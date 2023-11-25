import ChordProViewer from "@/components/ChordProViewer";
import { SongVersion } from "@/models/song";
import { Unit } from "@/models/unit";
import { useEffect, useState } from "react";

type VersionViewerProps = {
  version: SongVersion;
};

export default function VersionViewer({ version }: VersionViewerProps) {
  const [localIdToUnit, setLocalIdToUnit] = useState<Map<number, Unit>>(
    new Map()
  );
  const [unitSequence, setUnitSequence] = useState<number[]>();

  useEffect(() => {
    if (!version.units) return;

    setLocalIdToUnit(
      new Map(version.units.map((unit) => [unit.localId, unit]))
    );
  }, [version.units]);

  useEffect(() => {
    if (!version.unitSequence) return;

    setUnitSequence(
      (version.unitSequence as any as string).split(",").map((s) => parseInt(s))
    );
  }, [version.unitSequence]);

  return (
    <div className="columns-3">
      {unitSequence?.map((localId, idx) => {
        const unit = localIdToUnit.get(localId);
        if (!unit) return "ERROR";
        return (
          <ChordProViewer
            chordpro={unit.content}
            key={`${unit.localId}--${idx}`}
            withoutContainer
          />
        );
      })}
    </div>
  );
}
