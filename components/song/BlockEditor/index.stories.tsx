import { ClientSongUnit } from "@/prisma/models";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import BlockEditor from "./index";

const meta = {
  title: "song/BlockEditor",
  component: BlockEditor,
} satisfies Meta<typeof BlockEditor>;

export default meta;
type Story = StoryObj;

const SAMPLE_UNITS: ClientSongUnit[] = [
  { type: "INTRO", content: "[D] [G] [A]", order: 1, notes: null, repeatCount: 1 },
  {
    type: "VERSE",
    content: "[D]Twinkle, twinkle, [G]little [D]star,\n[G]How I [D]wonder [A]what you [D]are.",
    order: 2,
    notes: null,
    repeatCount: 1,
  },
  {
    type: "CHORUS",
    // Convenção colada ao acorde (sem \n entre os dois) — só assim ela
    // aparece acima do acorde (commentAbove); numa linha própria ela vira
    // um chip isolado (ver ANALISE.md, achado sobre chordsheetjs).
    content: "{c:Forte}[C]Santo, Santo, [G]Santo\n{c:Suave}[Am]é o [F]Senhor",
    order: 3,
    notes: "Levantar as mãos",
    repeatCount: 2,
  },
  {
    type: "VERSE",
    content: "[D]Segundo verso\n[G]Mais curtinho",
    order: 4,
    notes: null,
    repeatCount: 1,
  },
  { type: "ENDING", content: "[D]Final", order: 5, notes: null, repeatCount: 1 },
];

export const UmaColuna: Story = {
  render: () => {
    const [units, setUnits] = useState<ClientSongUnit[]>(SAMPLE_UNITS);
    return <BlockEditor units={units} columns={1} baseKey="D" onChangeUnits={setUnits} />;
  },
};

export const DuasColunas: Story = {
  render: () => {
    const [units, setUnits] = useState<ClientSongUnit[]>(SAMPLE_UNITS);
    return <BlockEditor units={units} columns={2} baseKey="D" onChangeUnits={setUnits} />;
  },
};

export const UmSoBloco: Story = {
  name: "Um só bloco (Apagar desabilitado — D12)",
  render: () => {
    const [units, setUnits] = useState<ClientSongUnit[]>([SAMPLE_UNITS[0]]);
    return <BlockEditor units={units} columns={1} baseKey="D" onChangeUnits={setUnits} />;
  },
};

export const ComBlocoDeTexto: Story = {
  render: () => {
    const [units, setUnits] = useState<ClientSongUnit[]>([
      ...SAMPLE_UNITS,
      {
        type: "TEXT",
        content: "Observação para o ministro de louvor: abrir com oração.",
        order: 6,
        notes: null,
        repeatCount: 1,
      },
    ]);
    return <BlockEditor units={units} columns={1} baseKey="D" onChangeUnits={setUnits} />;
  },
};
