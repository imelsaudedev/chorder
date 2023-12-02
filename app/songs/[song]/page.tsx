import SongForm from "@/fragments/SongForm";
import SongViewer from "@/fragments/SongViewer";
import { getSong, postSong } from "./actions";

export const dynamic = "force-dynamic";

export default async function SongPage({
  params,
  searchParams,
}: {
  params: { song: string };
  searchParams: { edit?: string; version?: number };
}) {
  const songSlug = params.song;
  const writeMode = searchParams.edit === "true" || songSlug === "new";
  const songId = parseInt(songSlug);
  const song = songId ? await getSong(songId) : null;

  return (
    <>
      {!writeMode && song && (
        <SongViewer song={song} versionIdx={searchParams.version || 0} />
      )}
      {writeMode && (
        <SongForm
          postSong={postSong}
          song={song}
          versionIdx={searchParams.version || 0}
        />
      )}
    </>
  );
}
