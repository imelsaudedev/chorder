import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import BigLetter from "./BigLetter";
import { Fragment } from "react";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "song/BigLetter",
  component: BigLetter,
} satisfies Meta<typeof BigLetter>;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  render: () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    return (
      <div>
        {letters.map((letter) => (
          <Fragment key={letter}>
            <BigLetter letter={letter} veryBig={true} />
            <BigLetter letter={letter} veryBig={false} />
          </Fragment>
        ))}
      </div>
    );
  },
};
