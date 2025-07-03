import { useFetchSongs } from "#api-client";
import SearchBar from "@/components/common/SearchBar";
import SongList from "@/components/song/SongList";
import SongListSkeleton from "@/components/song/SongList/SongListSkeleton";
import { ClientSong } from "@/prisma/models";
import { useCallback, useState } from "react";

type SongPickerProps = {
  excludedSongSlugs?: string[];
  onSelected: (song: ClientSong) => void;
};

export default function SongPicker({
  excludedSongSlugs,
  onSelected,
}: SongPickerProps) {
  const [query, setQuery] = useState("");
  const { songs, isLoading } = useFetchSongs({
    query,
    limitLines: 3,
    forceIncludeFirstLine: true,
    excludedSongSlugs,
  });
  const handleSelected = useCallback(
    (song: ClientSong) => {
      onSelected(song);
    },
    [onSelected]
  );
  const handleSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
  }, []);

  const isReady = songs && !isLoading;
  return (
    <div>
      <SearchBar defaultValue={query} onSearch={handleSearch} />
      {!isReady && <SongListSkeleton />}
      {isReady && (
        <SongList
          songs={songs}
          query={query}
          initialsInSeparateRow={true}
          onSelected={handleSelected}
        />
      )}
    </div>
  );
}
