"use client";

import { useFetchSongs } from "#api-client";
import SongListSkeleton from "@/components/song/SongList/SongListSkeleton";
import SongsTable from "@/components/song/SongsTable";
import { DEFAULT_SORT, SongSort } from "@/lib/songs-list-state";

type ClientSongListProps = {
  query?: string;
  excludedSongSlugs?: string[];
  tagIds?: number[];
  sort?: SongSort;
};

export default function ClientSongList({
  query = "",
  excludedSongSlugs,
  tagIds,
  sort = DEFAULT_SORT,
}: ClientSongListProps) {
  const { songs, isLoading } = useFetchSongs({
    query,
    limitLines: 6,
    forceIncludeFirstLine: true,
    excludedSongSlugs,
    tagIds,
    withUsageStats: true,
  });
  if (!songs || isLoading) {
    return <SongListSkeleton />;
  }
  return <SongsTable songs={songs} sort={sort} query={query} />;
}
