"use client";

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
  useEffect,
  useMemo,
  useState,
} from "react";
import UnitForm from "../UnitForm";
import AddUnitForm from "./AddUnitForm";
import FormField from "@/components/FormField";
import FormLabel from "@/components/FormLabel";
import BackArrow from "@/components/BackArrow";
import { ArrangementUnit, Song, SongArrangement } from "@/models/song";
import ChevronUpIcon from "@/components/icons/ChevronUpIcon";
import ChevronDownIcon from "@/components/icons/ChevronDownIcon";
import { useArrangementUnits } from "./hooks";
import { getUniqueUnits } from "./utils";
import { Button } from "@/components/ui/button";

export type PostSongAction = (
  songId: number | null,
  arrangementId: number | null,
  title: string,
  units: ArrangementUnit[],
  artist: string
) => void;

type SongFormProps = {
  song: Song | null;
  arrangement: SongArrangement | null;
  postSong: PostSongAction;
  setWriteMode: Dispatch<SetStateAction<boolean>>;
};

export default function SongForm({
  song,
  arrangement,
  postSong,
  setWriteMode,
}: SongFormProps) {
  const [title, setTitle] = useState(song?.title || "");
  const [artist, setArtist] = useState(song?.artist || "");
  const [songKey, setSongKey] = useState(arrangement?.key || "");
  const [keyManuallySet, setKeyManuallySet] = useState(!!arrangement?.key);
  const [
    arrangementUnits,
    computedKey,
    handleAddUnit,
    handleCreateUnit,
    handleUpdateUnit,
    buildRemoveUnitHandler,
    buildMoveUpHandler,
    buildMoveDownHandler,
  ] = useArrangementUnits(arrangement);

  useEffect(() => {
    if (!keyManuallySet) {
      setSongKey(computedKey);
    }
  }, [keyManuallySet, computedKey]);

  const postSongWithUnits = postSong.bind(
    null,
    song?.id || null,
    arrangement?.id || null,
    title,
    arrangementUnits,
    artist,
    songKey
  );

  const uniqueUnits = useMemo(
    () => getUniqueUnits(arrangementUnits),
    [arrangementUnits]
  );

  const handleManuallySetKey = useCallback(
    (key: string) => {
      setSongKey(key);
      setKeyManuallySet(true);
    },
    [setSongKey, setKeyManuallySet]
  );

  return (
    <form action={postSongWithUnits}>
      <Header>
        <BackArrow href="/songs" />
        <HeaderForm
          title={title}
          setTitle={setTitle}
          artist={artist}
          setArtist={setArtist}
          songKey={songKey}
          setSongKey={handleManuallySetKey}
        />
        <SaveButtonSet
          song={song}
          arrangement={arrangement}
          setWriteMode={setWriteMode}
        />
      </Header>
      <Main className="pt-4">
        <section className="max-w-lg mx-auto">
          {arrangementUnits.map((arrangementUnit, index) => {
            const unit = arrangementUnit.unit;

            if (unit) {
              return (
                <div key={index} className="flex">
                  <SortingButtons
                    buildMoveUpHandler={buildMoveUpHandler}
                    buildMoveDownHandler={buildMoveDownHandler}
                    index={index}
                    arrangementUnits={arrangementUnits}
                  />
                  <UnitForm
                    index={index}
                    unit={unit}
                    setUnit={handleUpdateUnit}
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
              units={uniqueUnits}
              onCreateUnit={handleCreateUnit}
              onAddExistingUnit={handleAddUnit}
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
  setTitle: Dispatch<SetStateAction<string>>;
  artist: string;
  setArtist: Dispatch<SetStateAction<string>>;
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
          defaultValue={artist}
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
  song,
  arrangement,
  setWriteMode,
}: {
  song: Song | null;
  arrangement: SongArrangement | null;
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
      {song && arrangement && (
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
  buildMoveUpHandler,
  buildMoveDownHandler,
  index,
  arrangementUnits,
}: {
  buildMoveUpHandler: (index: number) => MouseEventHandler | undefined;
  buildMoveDownHandler: (index: number) => MouseEventHandler | undefined;
  index: number;
  arrangementUnits: ArrangementUnit[];
}) {
  const hasPrev = index > 0;
  const hasNext = index < arrangementUnits.length - 1;

  return (
    <div className="flex flex-col">
      <Button
        disabled={!hasPrev}
        onClick={buildMoveUpHandler(index)}
        variant="ghost"
        size="icon"
      >
        <ChevronUpIcon />
      </Button>
      <Button
        disabled={!hasNext}
        onClick={buildMoveDownHandler(index)}
        variant="ghost"
        size="icon"
      >
        <ChevronDownIcon />
      </Button>
    </div>
  );
}
