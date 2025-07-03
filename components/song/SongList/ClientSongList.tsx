"use client";

import { useFetchSongs } from "#api-client";
import SongList from "@/components/song/SongList";
import SongListSkeleton from "@/components/song/SongList/SongListSkeleton";

type ClientSongListProps = {
  query?: string;
  excludedSongSlugs?: string[];
};

export default function ClientSongList({
  query = "",
  excludedSongSlugs,
}: ClientSongListProps) {
  const { songs, isLoading } = useFetchSongs({
    query,
    limitLines: 3,
    forceIncludeFirstLine: true,
    excludedSongSlugs,
  });
  if (isLoading) {
    return <SongListSkeleton />;
  }
  return <SongList songs={songs} query={query} />;
}
