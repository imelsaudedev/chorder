import AccessDeniedView from "@/components/auth/AccessDeniedView";
import { getLiveUserAuth } from "@/lib/auth-guard";
import { canEditSongs } from "@/lib/permissions";
import { retrieveArrangement } from "@/prisma/data";
import { redirect } from "next/navigation";
import ClientArrangementFormPage from "../../ClientArrangementFormPage";

export default async function EditSongPage({
  params,
  searchParams,
}: {
  params: Promise<{ song: string }>;
  searchParams: Promise<{ arrangement?: string }>;
}) {
  const [{ song }, resolvedSearch, live] = await Promise.all([
    params,
    searchParams,
    getLiveUserAuth(),
  ]);

  if (!live.authenticated) {
    const callback = `/songs/${song}/edit${
      resolvedSearch?.arrangement
        ? `?arrangement=${encodeURIComponent(resolvedSearch.arrangement)}`
        : ""
    }`;
    redirect(`/login?callbackUrl=${encodeURIComponent(callback)}`);
  }
  if (!canEditSongs(live.roles)) {
    return <AccessDeniedView />;
  }

  const arrangementId = resolvedSearch?.arrangement;

  if (!arrangementId) {
    throw new Error("Arrangement ID is required");
  }

  const arrangement = await retrieveArrangement(parseInt(arrangementId), {
    includeUnits: true,
    includeSong: true,
  });

  return <ClientArrangementFormPage arrangement={arrangement} />;
}
