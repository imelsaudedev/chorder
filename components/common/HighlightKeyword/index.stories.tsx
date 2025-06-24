import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import HighlightKeyword from "./index";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "common/HighlightKeyword",
  component: HighlightKeyword,
} satisfies Meta<typeof HighlightKeyword>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  args: {
    text: "This is a sample text to highlight keywords.",
    keyword: "highlight",
  },
  render: ({ text, keyword }) => (
    <div className="flex flex-col gap-4">
      <p>
        <HighlightKeyword text={text} keyword={keyword} />
      </p>
      <p>
        <HighlightKeyword text={text.toUpperCase()} keyword={keyword} />
      </p>
      <p>
        <HighlightKeyword text={text} keyword={keyword.toUpperCase()} />
      </p>
    </div>
  ),
};
