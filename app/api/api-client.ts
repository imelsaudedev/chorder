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
    ["/api/songs", queryString],
    ([url, queryString]: [string, string]) =>
      fetch(`${url}?${queryString}`).then((res) => res.json())
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

type FetchSongArrangementsArgs = {
  includeUnits?: boolean;
  includeSong?: boolean;
};
export function useFetchSongArrangements(
  slug: string,
  { includeSong = false, includeUnits = false }: FetchSongArrangementsArgs = {}
) {
  const { data, error, isLoading } = useSWR(
    [
      `/api/songs/${slug}/arrangements`,
      `includeUnits=${(!!includeUnits).toString()}&includeSong=${(!!includeSong).toString()}`,
    ],
    ([url, queryString]: [string, string]) =>
      fetch(`${url}?${queryString}`).then((res) => res.json())
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
    ? `/api/songs/${songSlug}/arrangements/${arrangementIdStr}`
    : `/api/arrangements/${arrangementIdStr}`;
  const queryString = "includeSong=true&includeUnits=true";

  const { data, error, isLoading } = useSWR(
    [url, queryString],
    ([url, queryString]: [string, string]) => {
      if (initialArrangement) {
        return Promise.resolve(initialArrangement);
      }
      return fetch(`${url}?${queryString}`).then((res) => res.json());
    }
  );
  return {
    arrangement: initialArrangement
      ? initialArrangement
      : (data as (ClientArrangement & { song: ClientSong }) | null),
    isLoading,
    isError: error,
  };
}

export function useCreateOrUpdateArrangement(arrangementId?: number | null) {
  async function createOrUpdateArrangement(
    url: string,
    { arg }: { arg: ClientArrangement }
  ) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(arg),
    });
    if (!response.ok) {
      throw new Error("Failed to create arrangement");
    }
    return response.json();
  }

  const url = arrangementId
    ? `/api/arrangements/${arrangementId}`
    : "/api/arrangements";

  const { data, trigger, isMutating, error } = useSWRMutation(
    url,
    createOrUpdateArrangement
  );
  return {
    arrangement: data as ClientArrangement | undefined,
    createOrUpdateArrangement: trigger,
    isMutating,
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

export function useMoveArrangement(arrangementId: number) {
  async function moveArrangement(url: string, { arg }: { arg: string }) {
    const response = await fetch(`${url}/move`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ targetSong: arg }),
    });
    if (!response.ok) {
      throw new Error("Failed to move arrangement");
    }
    return response.json();
  }

  const { trigger, isMutating, error } = useSWRMutation(
    `/api/arrangements/${arrangementId}`,
    moveArrangement
  );

  return {
    moveArrangement: trigger,
    isMutating,
    isError: error,
  };
}

export function useMakeArrangementDefault(arrangementId: number) {
  async function makeDefault(url: string) {
    const response = await fetch(`${url}/default`, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to make arrangement default");
    }
    return response.json();
  }

  const { trigger, isMutating, error } = useSWRMutation(
    `/api/arrangements/${arrangementId}`,
    makeDefault
  );

  return {
    makeArrangementDefault: trigger,
    isMutating,
    isError: error,
  };
}

export function useDuplicateArrangement(arrangementId: number) {
  async function duplicateArrangement(url: string) {
    const response = await fetch(`${url}/duplicate`, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to duplicate arrangement");
    }
    return response.json();
  }

  const { trigger, isMutating, error, data } = useSWRMutation(
    `/api/arrangements/${arrangementId}`,
    duplicateArrangement
  );

  return {
    duplicateArrangement: trigger,
    isMutating,
    isError: error,
    duplicatedArrangement: data,
  };
}

export function useFetchServices() {
  const { data, error, isLoading } = useSWR("/api/services", (...args) =>
    fetch(...args).then((res) => res.json())
  );
  return {
    services: data,
    isLoading,
    isError: error,
  };
}

export function useFetchService(slugOrId: string | number | null) {
  const url = `/api/services/${slugOrId}`;
  const { data, error, isLoading } = useSWR(url, (...args) =>
    slugOrId === null
      ? Promise.resolve(null)
      : fetch(...args).then((res) => res.json())
  );
  return {
    service: data,
    isLoading,
    isError: error,
  };
}

export function useDeleteService(slugOrId: string | number) {
  async function deleteService(url: string) {
    const response = await fetch(url, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete service");
    }
    return response.status === 204;
  }

  const { trigger, isMutating, error } = useSWRMutation(
    `/api/services/${slugOrId}`,
    deleteService
  );

  return {
    deleteService: trigger,
    isMutating,
    isError: error,
  };
}

export function useCreateOrUpdateService(
  serviceIdOrSlug: string | number | null
) {
  async function createOrUpdateService(url: string, { arg }: { arg: any }) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(arg),
    });
    if (!response.ok) {
      throw new Error(
        `Failed to create or update service. Status: ${response.status}. ${
          response.body ? await response.text() : ""
        }`
      );
    }
    return response.json();
  }

  const url = serviceIdOrSlug
    ? `/api/services/${serviceIdOrSlug}`
    : "/api/services";

  const { trigger, isMutating, error } = useSWRMutation(
    url,
    createOrUpdateService
  );

  return {
    createOrUpdateService: trigger,
    isMutating,
    isError: error,
  };
}
