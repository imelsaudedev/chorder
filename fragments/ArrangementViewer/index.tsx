import { DeleteArrangementAction } from "@/app/songs/[song]/actions";
import { parseChordPro } from "@/chopro/music";
import BackArrow from "@/components/BackArrow";
import ChordProLine from "@/components/ChordProLine";
import Header from "@/components/Header";
import KeyButtonSet from "@/components/KeyButtonSet";
import Main from "@/components/Main";
import ColumnsIcon from "@/components/icons/ColumnsIcon";
import ConfigIcon from "@/components/icons/ConfigIcon";
import EditIcon from "@/components/icons/EditIcon";
import TrashIcon from "@/components/icons/TrashIcon";
import { Button } from "@/components/ui/button";
import { SongHook } from "@/hooks/useSong";
import { SongUnitType } from "@/models/song-unit";
import { Line } from "chordsheetjs";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";

type ArrangementViewerProps = {
  songData: SongHook;
  setWriteMode: Dispatch<SetStateAction<boolean>>;
  deleteArrangement: DeleteArrangementAction;
};

type LineData = {
  line: Line;
  unitType: SongUnitType;
  isFirst: boolean;
  isLast: boolean;
};

export default function ArrangementViewer({
  songData,
  setWriteMode,
  deleteArrangement,
}: ArrangementViewerProps) {
  const {isNewArrangement, arrangementIndex, song, songUnitMap, songKey} = songData;
  const [transpose, setTranspose] = useState(0);
  const [columns, setColumns] = useState(1);
  const [showConfig, setShowConfig] = useState(false);
  const lineData = useMemo(() => {
    return songUnitMap
      ?.map((unit) => {
        const chordproHtml = parseChordPro(unit.content);
        return chordproHtml.lines.map((line, idx) => ({
          line,
          unitType: unit.type,
          isFirst: idx === 0,
          isLast: idx === chordproHtml.lines.length - 1,
        }));
      })
      .flat();
  }, [songUnitMap]);

  const handleToggleConfig = useCallback(() => {
    setShowConfig((prev) => !prev);
  }, [setShowConfig]);

  const handleEditButtonClick = useCallback(() => {
    setWriteMode(true);
  }, [setWriteMode]);

  if (isNewArrangement) {
    return null;
  }

  // TODO: MAYBE WE NEED A CONFIRMATION DIALOG FOR THIS?
  const deleteArrangementWithId = deleteArrangement.bind(null, song.serialize(), arrangementIndex);

  return (
    <>
      <Header>
        <BackArrow href="/songs" />
        <div className="flex ml-4 gap-2 flex-grow justify-between items-center">
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-none">{song.title}</span>
            {song.artist && <span className="text-sm">{song.artist}</span>}
          </div>
          <div className="flex gap-2">
            <KeyButtonSet
              originalKey={songKey || ""}
              transpose={transpose}
              setTranspose={setTranspose}
            />
            <Button variant="outline" onClick={handleToggleConfig}>
              <ConfigIcon />
            </Button>
          </div>
        </div>
      </Header>
      <Main className="pt-4">
        <SongConfig
          columns={columns}
          setColumns={setColumns}
          deleteArrangementWithId={deleteArrangementWithId}
          onEditButtonClick={handleEditButtonClick}
          visible={showConfig}
        />
        <ColumnViewer
          columns={columns}
          lineData={lineData}
          transpose={transpose}
          originalKey={songKey}
        />
      </Main>
    </>
  );
}

type SongConfigProps = {
  columns: number;
  setColumns: Dispatch<SetStateAction<number>>;
  deleteArrangementWithId: () => void;
  onEditButtonClick: () => void;
  visible: boolean;
};

function SongConfig({
  columns,
  setColumns,
  deleteArrangementWithId,
  onEditButtonClick,
  visible,
}: SongConfigProps) {
  return (
    <div
      className={`flex mb-4 bg-gray-200 p-2 rounded justify-between ${
        visible ? "" : "hidden"
      }`}
    >
      <div className="flex">
        <ColumnButtons columns={columns} setColumns={setColumns} />
      </div>
      <div className="flex">
        <form
          action={deleteArrangementWithId}
          className="grid place-content-center"
        >
          <Button type="submit" variant="ghost">
            <TrashIcon />
          </Button>
        </form>
        <Button onClick={onEditButtonClick} variant="ghost">
          <EditIcon />
        </Button>
      </div>
    </div>
  );
}

function ColumnButtons({
  columns,
  setColumns,
}: {
  columns: number;
  setColumns: Dispatch<SetStateAction<number>>;
}) {
  return (
    <div>
      <Button
        onClick={() => setColumns(1)}
        variant="outline"
        size="icon"
        rounded="left"
        disabled={columns === 1}
      >
        <ColumnsIcon count={1} />
      </Button>
      <Button
        onClick={() => setColumns(2)}
        variant="outline"
        size="icon"
        rounded="none"
        disabled={columns === 2}
      >
        <ColumnsIcon count={2} />
      </Button>
      <Button
        onClick={() => setColumns(3)}
        variant="outline"
        size="icon"
        rounded="none"
        disabled={columns === 3}
      >
        <ColumnsIcon count={3} />
      </Button>
      <Button
        onClick={() => setColumns(4)}
        variant="outline"
        size="icon"
        rounded="right"
        disabled={columns === 4}
      >
        <ColumnsIcon count={4} />
      </Button>
    </div>
  );
}

type ColumnViewerProps = {
  columns: number;
  lineData: (LineData | null)[];
  transpose: number;
  originalKey?: string;
};

function ColumnViewer({
  columns,
  lineData,
  transpose,
  originalKey,
}: ColumnViewerProps) {
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
          <div key={`col-${i}`} className="flex flex-col">
            {colData.map((data, idx) =>
              data ? (
                <ChordProLine
                  key={`col-${i}-line-${idx}`}
                  line={data.line}
                  unitType={data.unitType}
                  isFirst={data.isFirst}
                  isLast={data.isLast}
                  isLastOfColumn={idx === colData.length - 1}
                  grow={idx === colData.length - 1}
                  originalKey={originalKey}
                  transpose={transpose}
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
