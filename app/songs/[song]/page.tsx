import SongViewer from "@/fragments/SongViewer";
import { deleteArrangement, getSong, postSong } from "./actions";

export const dynamic = "force-dynamic";

export default async function SongPage({
  params,
  searchParams,
}: {
  params: { song: string };
  searchParams: { edit?: string; arrangement?: number };
}) {
  const songSlug = params.song;
  const songId = parseInt(songSlug);
  const song = songId ? await getSong(songId) : null;
  const writeMode = searchParams.edit === "true" || songSlug === "new";

  return (
    <SongViewer
      song={song}
      arrangementId={searchParams.arrangement || null}
      initialWriteMode={writeMode}
      postSong={postSong}
      deleteArrangement={deleteArrangement}
    />
  );
}
