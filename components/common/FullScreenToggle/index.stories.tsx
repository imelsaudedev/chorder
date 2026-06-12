import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
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
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFullScreen, setIsFullScreen] = useState(false);

    return (
      <div className="flex flex-col items-center justify-center min-w-[80vw]">
        {items.map((item, index) => (
          <div
            key={index}
            className={`p-4 mb-4 min-w-1/2 h-[70vh] rounded-lg ${
              index === currentIndex ? "bg-primary text-white" : "bg-gray-200"
            }`}
          >
            Item {item}
          </div>
        ))}
        <FullScreenToggle
          isFullScreen={isFullScreen}
          currentIndex={currentIndex}
          total={items.length}
          onPrev={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
          onNext={() => setCurrentIndex((i) => Math.min(i + 1, items.length - 1))}
          onToggle={() => setIsFullScreen((v) => !v)}
        />
      </div>
    );
  },
};
