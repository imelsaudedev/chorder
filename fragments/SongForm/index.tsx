import Header from "@/components/Header";
import Main from "@/components/Main";
import TextInput from "@/components/TextInput";
import messages from "@/i18n/messages";
import {
  ChangeEvent,
  Dispatch,
  MouseEventHandler,
  SetStateAction,
  useCallback,
} from "react";
import UnitForm from "../UnitForm";
import AddUnitForm from "./AddUnitForm";
import FormField from "@/components/FormField";
import FormLabel from "@/components/FormLabel";
import BackArrow from "@/components/BackArrow";
import ChevronUpIcon from "@/components/icons/ChevronUpIcon";
import ChevronDownIcon from "@/components/icons/ChevronDownIcon";
import { Button } from "@/components/ui/button";
import { PostSongAction } from "@/app/songs/[song]/actions";
import { SongHook } from "@/hooks/useSong";

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

function HeaderForm({
  title,
  setTitle,
  artist,
  setArtist,
  songKey,
  setSongKey,
}: {
  title: string;
  setTitle: (newValue: string) => void;
  artist: string | null;
  setArtist: (newValue: string | null) => void;
  songKey: string;
  setSongKey: (key: string) => void;
}) {
  const handleChangeTitle = (event: ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleChangeArtist = (event: ChangeEvent<HTMLInputElement>) => {
    setArtist(event.target.value);
  };

  const handleSongKeyChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSongKey(event.target.value);
  };

  return (
    <div className="flex mx-4 gap-2">
      <FormField>
        <FormLabel className="text-purple-700" htmlFor="title">
          {messages.songData.title}
        </FormLabel>
        <TextInput
          id="title"
          placeholder={messages.songData.titlePlaceholder}
          onChange={handleChangeTitle}
          defaultValue={title}
        />
      </FormField>
      <FormField>
        <FormLabel className="text-purple-700" htmlFor="artist">
          {messages.songData.artist}
        </FormLabel>
        <TextInput
          id="artist"
          placeholder={messages.songData.artistPlaceholder}
          onChange={handleChangeArtist}
          defaultValue={artist || ""}
        />
      </FormField>
      <FormField>
        <FormLabel className="text-purple-700" htmlFor="key">
          {messages.songData.key}
        </FormLabel>
        <TextInput
          id="key"
          placeholder={messages.songData.keyPlaceholder}
          onChange={handleSongKeyChange}
          defaultValue={songKey}
        />
      </FormField>
    </div>
  );
}

function SaveButtonSet({
  canCancel,
  setWriteMode,
}: {
  canCancel: boolean;
  setWriteMode: Dispatch<SetStateAction<boolean>>;
}) {
  const handleCancelEdit: MouseEventHandler = useCallback(
    (event) => {
      event.preventDefault();
      setWriteMode(false);
    },
    [setWriteMode]
  );

  return (
    <div className="ml-auto flex gap-2">
      {canCancel && (
        <button onClick={handleCancelEdit}>{messages.messages.cancel}</button>
      )}
      <button
        className="bg-purple-600 hover:bg-purple-500 text-white px-4 rounded"
        type="submit"
      >
        {messages.messages.save}
      </button>
    </div>
  );
}

function SortingButtons({
  moveUnitUp,
  moveUnitDown,
  songMapSize,
  index,
}: {
  moveUnitUp: (unitIndex: number) => void;
  moveUnitDown: (unitIndex: number) => void;
  songMapSize: number;
  index: number;
}) {
  const hasPrev = index > 0;
  const hasNext = index < songMapSize - 1;

  const handleMoveUp: MouseEventHandler = useCallback(
    (event) => {
      event.preventDefault();
      moveUnitUp(index);
    },
    [index, moveUnitUp]
  );

  const handleMoveDown: MouseEventHandler = useCallback(
    (event) => {
      event.preventDefault();
      moveUnitDown(index);
    },
    [index, moveUnitDown]
  );

  return (
    <div className="flex flex-col">
      <Button
        disabled={!hasPrev}
        onClick={handleMoveUp}
        variant="ghost"
        size="icon"
      >
        <ChevronUpIcon />
      </Button>
      <Button
        disabled={!hasNext}
        onClick={handleMoveDown}
        variant="ghost"
        size="icon"
      >
        <ChevronDownIcon />
      </Button>
    </div>
  );
}
