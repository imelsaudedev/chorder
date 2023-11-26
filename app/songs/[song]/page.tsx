import SongForm from "@/fragments/SongForm";
import SongViewer from "@/fragments/SongViewer";
import { getSong, postSong } from "./actions";

export const dynamic = "force-dynamic";

export default async function SongPage({
  params,
  searchParams,
}: {
  params: { song: string };
  searchParams: { edit?: string };
}) {
  const songSlug = params.song;
  const edit = searchParams.edit === "true" || songSlug === "new";
  const songId = parseInt(songSlug);
  const song = songId ? await getSong(songId) : null;

  return (
    <>
      {!edit && song && <SongViewer song={song} />}
      {edit && <SongForm postSong={postSong} song={song} />}
    </>
  );
}
