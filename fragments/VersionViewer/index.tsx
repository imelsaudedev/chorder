import BackArrow from "@/components/BackArrow";
import ChordProViewer from "@/components/ChordProViewer";
import Header from "@/components/Header";
import IconButton from "@/components/IconButton";
import Main from "@/components/Main";
import EditIcon from "@/components/icons/EditIcon";
import TrashIcon from "@/components/icons/TrashIcon";
import { Song, SongVersion } from "@/models/song";
import { Unit } from "@/models/unit";
import {
  Dispatch,
  Fragment,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";

export type DeleteVersionAction = (versionId: number) => void;

type VersionViewerProps = {
  song: Song;
  version: SongVersion;
  setWriteMode: Dispatch<SetStateAction<boolean>>;
  deleteVersion: DeleteVersionAction;
};

export default function VersionViewer({
  song,
  version,
  setWriteMode,
  deleteVersion,
}: VersionViewerProps) {
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

    setUnitSequence(version.unitSequence);
  }, [version.unitSequence]);

  const handleEditButtonClick = useCallback(() => {
    setWriteMode(true);
  }, [setWriteMode]);

  // TODO: MAYBE WE NEED A CONFIRMATION DIALOG FOR THIS?
  const deleteVersionWithId = deleteVersion.bind(null, version.id);

  return (
    <>
      <Header>
        <BackArrow href="/songs" />
        <div className="flex mx-4 gap-2 flex-grow justify-between items-center">
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-none">{song.title}</span>
            {song.artist && <span className="text-sm">{song.artist}</span>}
          </div>
          <div className="flex">
            <form
              action={deleteVersionWithId}
              className="grid place-content-center"
            >
              <IconButton type="submit">
                <TrashIcon />
              </IconButton>
            </form>
            <IconButton onClick={handleEditButtonClick}>
              <EditIcon />
            </IconButton>
          </div>
        </div>
      </Header>
      <Main className="pt-4">
        <div className="columns-2xs">
          {unitSequence?.map((localId, idx) => {
            const unit = localIdToUnit.get(localId);
            if (!unit) return "ERROR";
            return (
              <Fragment key={`unit--${idx}--${localId}`}>
                {idx > 0 && <div className="h-2"></div>}
                <ChordProViewer
                  chordpro={unit.content}
                  key={`${unit.localId}--${idx}`}
                  unitType={unit.type}
                  withoutContainer
                />
              </Fragment>
            );
          })}
        </div>
      </Main>
    </>
  );
}
