import { PostSongAction } from "@/app/songs/[song]/actions";
import BackArrow from "@/components/BackArrow";
import Header from "@/components/Header";
import Main from "@/components/Main";
import { SongHook } from "@/hooks/useSong";
import {
  Dispatch,
  SetStateAction,
  useCallback
} from "react";
import UnitForm from "../UnitForm";
import AddUnitForm from "./AddUnitForm";
import HeaderForm from "./HeaderForm";
import SaveButtonSet from "./SaveButtonSet";
import SortingButtons from "./SortingButtons";

type SongFormProps = {
  songData: SongHook;
  postSong: PostSongAction;
  setWriteMode: Dispatch<SetStateAction<boolean>>;
};

export default function SongForm({
  songData,
  postSong,
  setWriteMode,
}: SongFormProps) {
  const {song, isNewArrangement, title, setTitle, artist, setArtist, songKey, setSongKey, units, songUnitMap, createUnit, addUnit, moveUnitUp, moveUnitDown, buildRemoveUnitHandler, buildUpdateUnitHandler} = songData;

  const submitSong = postSong.bind(null, song.serialize() || null);

  const handleSetKey = useCallback(
    (key: string) => {
      setSongKey(key);
    },
    [setSongKey]
  );

  return (
    <form action={submitSong}>
      <Header>
        <BackArrow href="/songs" />
        <HeaderForm
          title={title}
          setTitle={setTitle}
          artist={artist}
          setArtist={setArtist}
          songKey={songKey || ""}
          setSongKey={handleSetKey}
        />
        <SaveButtonSet
          canCancel={!isNewArrangement}
          setWriteMode={setWriteMode}
        />
      </Header>
      <Main className="pt-4">
        <section className="max-w-lg mx-auto">
          {songUnitMap.map((unit, index) => {
            if (unit) {
              return (
                <div key={index} className="flex">
                  <SortingButtons
                    moveUnitUp={moveUnitUp}
                    moveUnitDown={moveUnitDown}
                    songMapSize={songUnitMap.length}
                    index={index}
                  />
                  <UnitForm
                    index={index}
                    unit={unit}
                    setUnit={buildUpdateUnitHandler(index)}
                    removeUnit={buildRemoveUnitHandler(index)}
                    className="flex-grow"
                  />
                </div>
              );
            }
            return "ERROR";
          })}
          <div className="pl-10">
            <AddUnitForm
              units={units}
              onCreateUnit={createUnit}
              onAddExistingUnit={addUnit}
            />
          </div>
        </section>
      </Main>
    </form>
  );
}
