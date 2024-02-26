import { parseChordPro } from "@/chopro/music";
import BackArrow from "@/components/BackArrow";
import ChordProLine from "@/components/ChordProLine";
import Header from "@/components/Header";
import IconButton from "@/components/IconButton";
import Main from "@/components/Main";
import ColumnsIcon from "@/components/icons/ColumnsIcon";
import EditIcon from "@/components/icons/EditIcon";
import TrashIcon from "@/components/icons/TrashIcon";
import { Song, SongArrangement } from "@/models/song";
import { UnitType } from "@/models/unit";
import { Line } from "chordsheetjs";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";

export type DeleteArrangementAction = (arrangementId: number) => void;

type ArrangementViewerProps = {
  song: Song;
  arrangement: SongArrangement;
  setWriteMode: Dispatch<SetStateAction<boolean>>;
  deleteArrangement: DeleteArrangementAction;
};

type LineData = {
  line: Line;
  unitType: UnitType;
  isFirst: boolean;
  isLast: boolean;
};

export default function ArrangementViewer({
  song,
  arrangement,
  setWriteMode,
  deleteArrangement,
}: ArrangementViewerProps) {
  const [columns, setColumns] = useState(1);
  const lineData = useMemo(() => {
    return arrangement.units
      ?.map((arrangementUnit) => {
        const unit = arrangementUnit.unit;
        if (!unit) return [null];
        const chordproHtml = parseChordPro(unit.content);
        return chordproHtml.lines.map((line, idx) => ({
          line,
          unitType: unit.type,
          isFirst: idx === 0,
          isLast: idx === chordproHtml.lines.length - 1,
        }));
      })
      .flat();
  }, [arrangement.units]);

  const handleEditButtonClick = useCallback(() => {
    setWriteMode(true);
  }, [setWriteMode]);

  if (!arrangement || !arrangement.id) {
    return null;
  }

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
            <ColumnButtons setColumns={setColumns} />
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
        <ColumnViewer columns={columns} lineData={lineData} />
      </Main>
    </>
  );
}

function ColumnButtons({
  setColumns,
}: {
  setColumns: Dispatch<SetStateAction<number>>;
}) {
  return (
    <>
      <IconButton onClick={() => setColumns(1)}>
        <ColumnsIcon count={1} />
      </IconButton>
      <IconButton onClick={() => setColumns(2)}>
        <ColumnsIcon count={2} />
      </IconButton>
      <IconButton onClick={() => setColumns(3)}>
        <ColumnsIcon count={3} />
      </IconButton>
      <IconButton onClick={() => setColumns(4)}>
        <ColumnsIcon count={4} />
      </IconButton>
    </>
  );
}

type ColumnViewerProps = {
  columns: number;
  lineData: (LineData | null)[];
};

function ColumnViewer({ columns, lineData }: ColumnViewerProps) {
  let gridCols;
  if (columns <= 1) {
    gridCols = "grid-cols-1";
  }
  if (columns === 2) {
    gridCols = "grid-cols-2";
  }
  if (columns === 3) {
    gridCols = "grid-cols-3";
  }
  if (columns >= 4) {
    gridCols = "grid-cols-4";
  }
  const className = `grid ${gridCols} gap-4`;

  return (
    <div className={className}>
      {Array.from(Array(columns).keys()).map((i) => {
        const linesPerColumn = Math.ceil(lineData.length / columns);
        const colData = lineData.slice(
          i * linesPerColumn,
          Math.min((i + 1) * linesPerColumn, lineData.length)
        );
        return (
          <div key={`col-${i}`} className="flex flex-col gap-4">
            {colData.map((data, idx) =>
              data ? (
                <ChordProLine
                  key={`col-${i}-line-${idx}`}
                  line={data.line}
                  unitType={data.unitType}
                  isFirst={data.isFirst}
                  isLast={data.isLast}
                  grow={idx === colData.length - 1}
                />
              ) : (
                <span key={`col-${i}-line-${idx}`}>ERROR</span>
              )
            )}
          </div>
        );
      })}
    </div>
  );
}
