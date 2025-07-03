import { fn } from "storybook/test";

// Must use relative import to avoid circular dependency issues: https://storybook.js.org/docs/writing-stories/mocking-data-and-modules/mocking-modules#:~:text=Using%20a%20subpath%20or%20alias%20import%20would%20result%20in%20it%20importing%20itself.
import * as actual from "./api-client";

export const useCreateOrUpdateArrangement = fn(
  actual.useCreateOrUpdateArrangement
).mockName("useCreateOrUpdateArrangement");
export const useDeleteArrangement = fn(actual.useDeleteArrangement).mockName(
  "useDeleteArrangement"
);
export const useFetchArrangement = fn(actual.useFetchArrangement).mockName(
  "useFetchArrangement"
);
export const useFetchSong = fn(actual.useFetchSong).mockName("useFetchSong");
export const useFetchSongArrangements = fn(
  actual.useFetchSongArrangements
).mockName("useFetchSongArrangements");
export const useFetchSongs = fn(actual.useFetchSongs).mockName("useFetchSongs");
export const useMoveArrangement = fn(actual.useMoveArrangement).mockName(
  "useMoveArrangement"
);
export const useMakeArrangementDefault = fn(
  actual.useMakeArrangementDefault
).mockName("useMakeArrangementDefault");
