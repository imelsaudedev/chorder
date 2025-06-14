"use client";

import {
  ClientSong,
  SongArrangement,
  SongArrangementWithUnits,
} from "@/prisma/models";
import useSWR from "swr";

type FetchSongsArgs = {
  query?: string;
  limitLines?: number;
  forceIncludeFirstLine?: boolean;
  excludedSongSlugs?: string[];
};
export function useFetchSongs({
  query,
  limitLines,
  forceIncludeFirstLine,
  excludedSongSlugs,
}: FetchSongsArgs) {
  const params = new URLSearchParams();
  if (query) {
    params.set("query", query);
  }
  if (limitLines) {
    params.set("limitLines", limitLines.toString());
  }
  if (forceIncludeFirstLine) {
    params.set("forceIncludeFirstLine", forceIncludeFirstLine.toString());
  }
  if (excludedSongSlugs && excludedSongSlugs.length > 0) {
    params.set("excludedSongSlugs", excludedSongSlugs.join(","));
  }
  const queryString = params.toString();
  const { data, error, isLoading } = useSWR(
    `/api/songs?${queryString}`,
    (...args) => fetch(...args).then((res) => res.json())
  );
  return {
    songs: data as ClientSong[],
    isLoading,
    isError: error,
  };
}

export function useFetchSong(slug: string) {
  const { data, error, isLoading } = useSWR(`/api/songs/${slug}`, (...args) =>
    fetch(...args).then((res) => res.json())
  );
  return {
    song: data as ClientSong,
    isLoading,
    isError: error,
  };
}

export function useFetchSongArrangements(slug: string, includeUnits?: boolean) {
  const { data, error, isLoading } = useSWR(
    `/api/songs/${slug}/arrangements?includeUnits=${(!!includeUnits).toString()}`,
    (...args) => fetch(...args).then((res) => res.json())
  );
  if (includeUnits) {
    return {
      arrangements: data as SongArrangementWithUnits[],
      isLoading,
      isError: error,
    };
  } else {
    return {
      arrangements: data as SongArrangement[],
      isLoading,
      isError: error,
    };
  }
}

export function useFetchArrangement(songSlug: string, arrangementId?: number) {
  const { data, error, isLoading } = useSWR(
    `/api/songs/${songSlug}/arrangements/${
      arrangementId?.toString() ?? "default"
    }`,
    (...args) => fetch(...args).then((res) => res.json())
  );
  return {
    arrangement: data,
    isLoading,
    isError: error,
  };
}
