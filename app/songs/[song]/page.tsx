import SongViewer from "@/fragments/SongViewer";
import { deleteVersion, getSong, postSong } from "./actions";

export const dynamic = "force-dynamic";

export default async function SongPage({
  params,
  searchParams,
}: {
  params: { song: string };
  searchParams: { edit?: string; version?: number };
}) {
  const songSlug = params.song;
  const songId = parseInt(songSlug);
  const song = songId ? await getSong(songId) : null;
  const writeMode = searchParams.edit === "true" || songSlug === "new";

  return (
    <SongViewer
      song={song}
      versionId={searchParams.version || null}
      initialWriteMode={writeMode}
      postSong={postSong}
      deleteVersion={deleteVersion}
    />
  );
}
