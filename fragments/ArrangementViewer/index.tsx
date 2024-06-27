import { DeleteArrangementAction } from "@/app/songs/[song]/actions";
import { parseChordPro } from "@/chopro/music";
import BackArrow from "@/components/BackArrow";
import Header from "@/components/Header";
import KeyButtonSet from "@/components/KeyButtonSet";
import Main from "@/components/Main";
import ConfigIcon from "@/components/icons/ConfigIcon";
import { Button } from "@/components/ui/button";
import { SongHook } from "@/hooks/useSong";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import ColumnViewer from "./ColumnViewer";
import SongConfig from "./SongConfig";

type ArrangementViewerProps = {
  songData: SongHook;
  setWriteMode: Dispatch<SetStateAction<boolean>>;
  deleteArrangement: DeleteArrangementAction;
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
