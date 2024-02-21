"use client";

import Header from "@/components/Header";
import Main from "@/components/Main";
import TextInput from "@/components/TextInput";
import messages from "@/i18n/messages";
import { Unit } from "@/models/unit";
import {
  Dispatch,
  MouseEventHandler,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import UnitForm from "../UnitForm";
import { getNextLocalId, updateTypeIndices } from "./utils";
import AddUnitForm from "./AddUnitForm";
import FormField from "@/components/FormField";
import FormLabel from "@/components/FormLabel";
import BackArrow from "@/components/BackArrow";
import { Song, SongArrangement } from "@/models/song";
import IconButton from "@/components/IconButton";
import ChevronUpIcon from "@/components/icons/ChevronUpIcon";
import ChevronDownIcon from "@/components/icons/ChevronDownIcon";

export type PostSongAction = (
  songId: number | null,
  arrangementId: number | null,
  title: string,
  availableUnits: Unit[],
  unitSequence: number[],
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
  const [availableUnits, setAvailableUnits] = useState<Unit[]>(
    arrangement?.units || []
  );
  const [localIdToUnit, setLocalIdToUnit] = useState<Map<number, Unit>>();
  const [unitSequence, setUnitSequence] = useState<number[]>(
    arrangement?.unitSequence || []
  );

  useEffect(() => {
    setLocalIdToUnit(
      new Map<number, Unit>(availableUnits.map((unit) => [unit.localId, unit]))
    );
  }, [availableUnits]);

  const handleChangeTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleChangeArtist = (event: React.ChangeEvent<HTMLInputElement>) => {
    setArtist(event.target.value);
  };

  const handleCreateUnit = () => {
    const newUnit: Unit = {
      type: "NEUTRAL",
      content: "",
      preview: false,
      localId: getNextLocalId(availableUnits),
    };
    setAvailableUnits((units) => updateTypeIndices([...units, newUnit]));
    handleAddExistingUnit(newUnit);
  };

  const handleAddExistingUnit = (unit: Unit) => {
    setUnitSequence((currSequence) => [...currSequence, unit.localId]);
  };

  const updateUnits = (updatedUnit: Unit) => {
    setAvailableUnits((units) => {
      const newUnits = units.map((unit) => {
        if (unit.localId === updatedUnit.localId) {
          return { ...unit, ...updatedUnit };
        }
        return unit;
      });
      return updateTypeIndices(newUnits);
    });
  };

  const buildRemoveUnitHandler = (index: number) => {
    return () => {
      const selectedLocalId = unitSequence[index];
      if (
        unitSequence.filter((localId) => localId === selectedLocalId).length <=
        1
      ) {
        setAvailableUnits((units) => {
          const newUnits = [...units];
          const index = newUnits
            .map((unit) => unit.localId)
            .indexOf(selectedLocalId);
          newUnits.splice(index, 1);
          return updateTypeIndices(newUnits);
        });
      }

      setUnitSequence((currSequence) => {
        const newSequence = [...currSequence];
        newSequence.splice(index, 1);
        return newSequence;
      });
    };
  };

  const postSongWithUnits = postSong.bind(
    null,
    song?.id || null,
    arrangement?.id || null,
    title,
    availableUnits,
    unitSequence,
    artist
  );

  const handleCancelEdit: MouseEventHandler = useCallback(
    (event) => {
      event.preventDefault();
      setWriteMode(false);
    },
    [setWriteMode]
  );

  return (
    <form action={postSongWithUnits}>
      <Header>
        <BackArrow href="/songs" />
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
        </div>
        <div className="ml-auto flex gap-2">
          {song && arrangement && (
            <button onClick={handleCancelEdit}>
              {messages.messages.cancel}
            </button>
          )}
          <button
            className="bg-purple-600 hover:bg-purple-500 text-white px-4 rounded"
            type="submit"
          >
            {messages.messages.save}
          </button>
        </div>
      </Header>
      <Main className="pt-4">
        <section className="max-w-lg mx-auto">
          {unitSequence.map((localId, index) => {
            const unit = localIdToUnit?.get(localId);

            if (unit) {
              const hasPrev = index > 0;
              const hasNext = index < unitSequence.length - 1;

              const handleMoveUp: MouseEventHandler | undefined = hasPrev
                ? (event) => {
                    setUnitSequence((currSequence) => [
                      ...currSequence.slice(0, index - 1),
                      unit.localId,
                      currSequence[index - 1],
                      ...currSequence.slice(index + 1, currSequence.length),
                    ]);
                    event.preventDefault();
                  }
                : undefined;
              const handleMoveDown: MouseEventHandler | undefined = hasNext
                ? (event) => {
                    setUnitSequence((currSequence) => [
                      ...currSequence.slice(0, index),
                      currSequence[index + 1],
                      unit.localId,
                      ...currSequence.slice(index + 2, currSequence.length),
                    ]);
                    event.preventDefault();
                  }
                : undefined;

              return (
                <div key={index} className="flex">
                  <div className="flex flex-col">
                    <IconButton disabled={!hasPrev} onClick={handleMoveUp}>
                      <ChevronUpIcon />
                    </IconButton>
                    <IconButton disabled={!hasNext} onClick={handleMoveDown}>
                      <ChevronDownIcon />
                    </IconButton>
                  </div>
                  <UnitForm
                    index={index}
                    unit={unit}
                    setUnit={updateUnits}
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
              units={availableUnits}
              onCreateUnit={handleCreateUnit}
              onAddExistingUnit={handleAddExistingUnit}
            />
          </div>
        </section>
      </Main>
    </form>
  );
}
