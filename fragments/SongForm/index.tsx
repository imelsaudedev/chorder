"use client";

import Header from "@/components/Header";
import Heading from "@/components/Heading";
import Main from "@/components/Main";
import TextInput from "@/components/TextInput";
import ExpandingArrow from "@/components/expanding-arrow";
import messages from "@/i18n/messages";
import { Unit } from "@/models/unit";
import Link from "next/link";
import { useState } from "react";
import UnitForm from "../UnitForm";

export default function SongForm() {
  const [units, setUnits] = useState<Unit[]>([]);

  const handleCreateUnit = () => {
    setUnits((units) => [...units, { type: "neutral", content: "" }]);
  };

  const buildUpdater = (index: number) => {
    return (unit: Unit) => {
      setUnits((units) => {
        const newUnits = [...units];
        newUnits[index] = unit;
        return newUnits;
      });
    };
  };

  return (
    <>
      {" "}
      <Header>
        <Link href="/songs" className="flex group mr-8 text-purple-500">
          <ExpandingArrow className="rotate-180 h-6 w-6" />
        </Link>
        <>
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
        </>
      </Header>
      <Main>
        <Heading level={2} className="flex items-center gap-4 mb-8 mt-6">
          {messages.songData.unit}s{" "}
          <button
            className="h-8 w-8 text-sm shadow-lg inline-flex items-center justify-center bg-none rounded-full bg-purple-600 text-purple-50"
            onClick={handleCreateUnit}
          >
            +
          </button>
        </Heading>
        <div className="flex flex-wrap gap-4 pl-4">
          {units.map((unit, index) => (
            <UnitForm key={index} unit={unit} setUnit={buildUpdater(index)} />
          ))}
        </div>
      </Main>
    </>
  );
}
