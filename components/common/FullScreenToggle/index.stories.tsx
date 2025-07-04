import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { useRef, useState } from "react";
import FullScreenToggle from "./index";

const meta = {
  title: "common/FullScreenToggle",
  component: FullScreenToggle,
} satisfies Meta<typeof FullScreenToggle>;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  render: () => {
    const items = [1, 2, 3, 4, 5];
    const unitRefs = useRef<(HTMLDivElement | null)[]>(items.map(() => null));
    const [curItem, setCurItem] = useState(0);

    return (
      <div className="flex flex-col items-center justify-center min-w-[80vw]">
        {items.map((item, index) => (
          <div
            key={index}
            ref={(el) => (unitRefs.current[index] = el)}
            className={`p-4 mb-4 min-w-1/2 h-[70vh] rounded-lg ${
              index === curItem ? "bg-primary text-white" : "bg-gray-200"
            }`}
          >
            Item {item}
          </div>
        ))}
        <FullScreenToggle
          unitRefs={unitRefs}
          onCurrentIndexChanged={setCurItem}
        />
      </div>
    );
  },
};
