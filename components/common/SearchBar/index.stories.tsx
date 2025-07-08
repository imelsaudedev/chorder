import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import SearchBar from "./index";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "common/SearchBar",
  component: SearchBar,
} satisfies Meta<typeof SearchBar>;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  render: () => {
    const [query, setQuery] = useState("");

    const handleSearch = (term: string) => {
      setQuery(term);
    };

    return (
      <>
        <div className="flex flex-col gap-2 mb-4">
          <Label htmlFor="term">Term:</Label>
          <Input id="term" disabled value={query} />
        </div>
        <SearchBar defaultValue={query} onSearch={handleSearch} />
      </>
    );
  },
};
