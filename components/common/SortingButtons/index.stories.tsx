import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import SortingButtons from "./index";

const meta = {
  title: "common/SortingButtons",
  component: SortingButtons,
} satisfies Meta<typeof SortingButtons>;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  render: () => {
    const [items, setItems] = useState(["item1", "item2", "item3"]);

    const moveUnitDown = (index: number) => {
      if (index < items.length - 1) {
        const newItems = [...items];
        [newItems[index], newItems[index + 1]] = [
          newItems[index + 1],
          newItems[index],
        ];
        setItems(newItems);
      }
    };
    const moveUnitUp = (index: number) => {
      if (index > 0) {
        const newItems = [...items];
        [newItems[index], newItems[index - 1]] = [
          newItems[index - 1],
          newItems[index],
        ];
        setItems(newItems);
      }
    };

    return (
      <div>
        {items.map((item, index) => (
          <div className="flex items-center gap-2 mb-2" key={item}>
            <SortingButtons
              moveUnitUp={() => moveUnitUp(index)}
              moveUnitDown={() => moveUnitDown(index)}
              listSize={items.length}
              index={index}
            />
            <span>{item}</span>
          </div>
        ))}
      </div>
    );
  },
};
