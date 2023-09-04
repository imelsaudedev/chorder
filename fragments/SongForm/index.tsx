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

export default function SongForm() {
  const [availableUnits, setAvailableUnits] = useState<Unit[]>([]);
  const [unitSequence, setUnitSequence] = useState<Unit[]>([]);

  const handleCreateUnit = () => {
    const newUnit: Unit = { type: "neutral", content: "" };
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

  return (
    <>
      <Header>
        <Link href="/songs" className="flex group mr-6 text-purple-500">
          <ExpandingArrow className="rotate-180 h-6 w-6" />
        </Link>
        <div className="flex mx-4 gap-2">
          <TextInput
            label={messages.songData.title}
            labelClassName="text-purple-700"
            id="title"
            placeholder={messages.songData.titlePlaceholder}
          />
          <TextInput
            label={messages.songData.artist}
            labelClassName="text-purple-700"
            id="title"
            placeholder={messages.songData.artistPlaceholder}
          />
        </div>
      </Header>
      <Main className="pt-4">
        <section className="columns-xs gap-4">
          {unitSequence.map((unit, index) => (
            <UnitForm
              key={index}
              index={index}
              unit={unit}
              setUnit={updateUnits}
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
