import { retrieveArrangement } from "@/prisma/data";
import ClientArrangementFormPage from "../../ClientArrangementFormPage";

export default async function EditSongPage({
  params,
  searchParams,
}: {
  params: { song: string };
  searchParams: { arrangement?: string };
}) {
  const arrangementId = (await searchParams)?.arrangement;

  if (!arrangementId) {
    throw new Error("Arrangement ID is required");
  }

  const arrangement = await retrieveArrangement(parseInt(arrangementId), {
    includeUnits: true,
    includeSong: true,
  });

  return <ClientArrangementFormPage arrangement={arrangement} />;
}
