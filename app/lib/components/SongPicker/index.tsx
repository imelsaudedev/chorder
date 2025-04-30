import { useCallback, useState } from "react";
import SongList from "../SongList";
import { ClientSong } from "@/prisma/models";
import SearchBar from "./SearchBar";

type SongPickerProps = {
  onSelected: (song: ClientSong) => void;
};

export default function SongPicker({ onSelected }: SongPickerProps) {
  const [query, setQuery] = useState("");
  const handleSelected = useCallback(
    (song: ClientSong) => {
      onSelected(song);
    },
    [onSelected]
  );
  return (
    <div>
      <SearchBar setQuery={setQuery} />
      <SongList
        query={query}
        initialsInSeparateRow={true}
        onSelected={handleSelected}
      />
    </div>
  );
}
