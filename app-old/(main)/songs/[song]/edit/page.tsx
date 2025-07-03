import { retrieveArrangement } from "@/prisma/data";
import ClientArrangementEditPage from "./ClientArrangementEditPage";

export default async function EditSongPage({
  params,
  searchParams,
}: {
  params: { song: string };
  searchParams: { arrangement?: number };
}) {
  const { song: songSlugOrId } = await params;
  const arrangementId = (await searchParams)?.arrangement;

  const arrangement = await retrieveArrangement(arrangementId, {
    songSlugOrId,
    includeUnits: true,
  });

  if (!song || !arrangement) {
    return null;
  }

  return <ClientArrangementEditPage arrangement={arrangement} />;
}
