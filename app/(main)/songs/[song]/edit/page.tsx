import { retrieveArrangement, retrieveSong } from "@/prisma/data";
import ClientArrangementEditPage from "./ClientArrangementEditPage";

export default async function NewSongPage({
  params,
  searchParams,
}: {
  params: { song: string };
  searchParams: { arrangement?: number };
}) {
  const { song: songSlug } = await params;
  const arrangementId = (await searchParams)?.arrangement;

  const [song, arrangement] = await Promise.all([
    retrieveSong(songSlug),
    retrieveArrangement(arrangementId ?? "default", {
      songSlug,
      includeUnits: true,
    }),
  ]);

  if (!song || !arrangement) {
    return null;
  }

  return <ClientArrangementEditPage song={song} arrangement={arrangement} />;
}
