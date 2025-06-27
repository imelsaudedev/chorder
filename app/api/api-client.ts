"use client";

import { ClientArrangement, ClientSong } from "@/prisma/models";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

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
  return {
    arrangements: data as ClientArrangement[],
    isLoading,
    isError: error,
  };
}

export function useFetchArrangement(
  songSlug?: string,
  arrangementId?: number,
  initialArrangement?: ClientArrangement | null
) {
  if (!songSlug && !arrangementId && !initialArrangement) {
    throw new Error(
      "Either songSlug, arrangementId or initialArrangement must be provided"
    );
  }

  const arrangementIdStr = arrangementId?.toString() ?? "default";
  const url = songSlug
    ? `/api/songs/${songSlug}/arrangements/${arrangementIdStr}?includeSong=true&includeUnits=true`
    : `/api/arrangements/${arrangementIdStr}?includeSong=true&includeUnits=true`;

  const { data, error, isLoading } = useSWR(url, (...args) => {
    if (initialArrangement) {
      return Promise.resolve(initialArrangement);
    }
    return fetch(...args).then((res) => res.json());
  });
  return {
    arrangement: initialArrangement
      ? initialArrangement
      : (data as (ClientArrangement & { song: ClientSong }) | null),
    isLoading,
    isError: error,
  };
}

export function useDeleteArrangement(arrangementId: number) {
  const deleteArrangement = async () => {
    const response = await fetch(`/api/arrangements/${arrangementId}`, {
      method: "DELETE",
    });
    return response.ok;
  };

  const { data, trigger, isMutating, error } = useSWRMutation(
    `/api/arrangements/${arrangementId}`,
    deleteArrangement
  );

  return {
    success: data as boolean | undefined,
    deleteArrangement: trigger,
    isMutating,
    isError: error,
  };
}
