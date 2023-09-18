"use client";

import Header from "@/components/Header";
import Main from "@/components/Main";
import TextInput from "@/components/TextInput";
import ExpandingArrow from "@/components/expanding-arrow";
import messages from "@/i18n/messages";
import { Unit } from "@/models/unit";
import Link from "next/link";
import { useState } from "react";
import UnitForm from "../UnitForm";
import { updateLocalIds } from "./utils";
import AddUnitForm from "./AddUnitForm";
import FormField from "@/components/FormField";
import FormLabel from "@/components/FormLabel";

export default function SongForm() {
  const [availableUnits, setAvailableUnits] = useState<Unit[]>([]);
  const [unitSequence, setUnitSequence] = useState<Unit[]>([]);

  const handleCreateUnit = () => {
    const newUnit: Unit = {
      type: "neutral",
      content: "",
      preview: false,
    };
    setAvailableUnits((units) => updateLocalIds([...units, newUnit]));
    handleAddExistingUnit(newUnit);
  };

  const handleAddExistingUnit = (unit: Unit) => {
    setUnitSequence((currSequence) => [...currSequence, unit]);
  };

  const updateUnits = (updatedUnit: Unit) => {
    setAvailableUnits((units) => {
      const newUnits = [...units];
      const index = newUnits
        .map((unit) => unit.localId)
        .indexOf(updatedUnit.localId);
      Object.assign(newUnits[index], updatedUnit);
      return updateLocalIds(newUnits);
    });
  };

  const buildRemoveUnitHandler = (index: number) => {
    return () => {
      const localId = unitSequence[index].localId;
      if (
        unitSequence.filter((unit: Unit) => unit.localId === localId).length <=
        1
      ) {
        setAvailableUnits((units) => {
          const newUnits = [...units];
          const index = newUnits.map((unit) => unit.localId).indexOf(localId);
          newUnits.splice(index, 1);
          return updateLocalIds(newUnits);
        });
      }

      setUnitSequence((currSequence) => {
        const newSequence = [...currSequence];
        newSequence.splice(index, 1);
        return newSequence;
      });
    };
  };

  return (
    <>
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
            />
          </FormField>
          <FormField>
            <FormLabel className="text-purple-700" htmlFor="artist">
              {messages.songData.artist}
            </FormLabel>
            <TextInput
              id="artist"
              placeholder={messages.songData.artistPlaceholder}
            />
          </FormField>
        </div>
      </Header>
      <Main className="pt-4">
        <section className="columns-sm">
          {unitSequence.map((unit, index) => (
            <UnitForm
              key={index}
              index={index}
              unit={unit}
              setUnit={updateUnits}
              removeUnit={buildRemoveUnitHandler(index)}
            />
          ))}
          <AddUnitForm
            units={availableUnits}
            onCreateUnit={handleCreateUnit}
            onAddExistingUnit={handleAddExistingUnit}
          />
        </section>
      </Main>
    </>
  );
}
