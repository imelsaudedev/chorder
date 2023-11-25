"use client";

import Header from "@/components/Header";
import Main from "@/components/Main";
import TextInput from "@/components/TextInput";
import ExpandingArrow from "@/components/expanding-arrow";
import messages from "@/i18n/messages";
import { Unit } from "@/models/unit";
import Link from "next/link";
import { useEffect, useState } from "react";
import UnitForm from "../UnitForm";
import { getNextLocalId, updateTypeIndices } from "./utils";
import AddUnitForm from "./AddUnitForm";
import FormField from "@/components/FormField";
import FormLabel from "@/components/FormLabel";

type SongFormProps = {
  postSong: (
    title: string,
    availableUnits: Unit[],
    unitSequence: number[],
    artist: string
  ) => void;
};

export default function SongForm({ postSong }: SongFormProps) {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [availableUnits, setAvailableUnits] = useState<Unit[]>([]);
  const [localIdToUnit, setLocalIdToUnit] = useState<Map<number, Unit>>();
  const [unitSequence, setUnitSequence] = useState<number[]>([]);

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
    title,
    availableUnits,
    unitSequence,
    artist
  );
  return (
    <form action={postSongWithUnits}>
      <Header>
        <Link href="/songs" className="flex group mr-6 text-purple-500">
          <ExpandingArrow className="rotate-180 h-6 w-6" />
        </Link>
        <div className="flex mx-4 gap-2">
          <FormField>
            <FormLabel className="text-purple-700" htmlFor="title">
              {messages.songData.title}
            </FormLabel>
            <TextInput
              id="title"
              placeholder={messages.songData.titlePlaceholder}
              onChange={handleChangeTitle}
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
            />
          </FormField>
        </div>
        <button
          className="ml-auto bg-purple-600 hover:bg-purple-500 text-white px-4 rounded"
          type="submit"
        >
          {messages.messages.save}
        </button>
      </Header>
      <Main className="pt-4">
        <section className="max-w-lg mx-auto">
          {unitSequence.map((localId, index) => {
            const unit = localIdToUnit?.get(localId);
            if (unit) {
              return (
                <UnitForm
                  key={index}
                  index={index}
                  unit={unit}
                  setUnit={updateUnits}
                  removeUnit={buildRemoveUnitHandler(index)}
                />
              );
            }
            return "ERROR";
          })}
          <AddUnitForm
            units={availableUnits}
            onCreateUnit={handleCreateUnit}
            onAddExistingUnit={handleAddExistingUnit}
          />
        </section>
      </Main>
    </form>
  );
}
