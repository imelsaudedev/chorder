import BackArrow from "@/components/BackArrow";
import ChordProViewer from "@/components/ChordProViewer";
import Header from "@/components/Header";
import IconButton from "@/components/IconButton";
import Main from "@/components/Main";
import EditIcon from "@/components/icons/EditIcon";
import TrashIcon from "@/components/icons/TrashIcon";
import { Song, SongArrangement } from "@/models/song";
import { Unit } from "@/models/unit";
import {
  Dispatch,
  Fragment,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";

export type DeleteArrangementAction = (arrangementId: number) => void;

type ArrangementViewerProps = {
  song: Song;
  arrangement: SongArrangement;
  setWriteMode: Dispatch<SetStateAction<boolean>>;
  deleteArrangement: DeleteArrangementAction;
};

export default function ArrangementViewer({
  song,
  arrangement,
  setWriteMode,
  deleteArrangement,
}: ArrangementViewerProps) {
  const [localIdToUnit, setLocalIdToUnit] = useState<Map<number, Unit>>(
    new Map()
  );
  const [unitSequence, setUnitSequence] = useState<number[]>();

  useEffect(() => {
    if (!arrangement.units) return;

    setLocalIdToUnit(
      new Map(arrangement.units.map((unit) => [unit.localId, unit]))
    );
  }, [arrangement.units]);

  useEffect(() => {
    if (!arrangement.unitSequence) return;

    setUnitSequence(arrangement.unitSequence);
  }, [arrangement.unitSequence]);

  const handleEditButtonClick = useCallback(() => {
    setWriteMode(true);
  }, [setWriteMode]);

  // TODO: MAYBE WE NEED A CONFIRMATION DIALOG FOR THIS?
  const deleteArrangementWithId = deleteArrangement.bind(null, arrangement.id);

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
              action={deleteArrangementWithId}
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