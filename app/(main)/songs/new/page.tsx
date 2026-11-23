import AccessDeniedView from "@/components/auth/AccessDeniedView";
import { getLiveUserAuth } from "@/lib/auth-guard";
import { canEditSongs } from "@/lib/permissions";
import { redirect } from "next/navigation";
import ClientArrangementFormPage from "../ClientArrangementFormPage";

export default async function NewSongPage({
  searchParams,
}: {
  searchParams: Promise<{ title?: string; artist?: string; tagIds?: string }>;
}) {
  const live = await getLiveUserAuth();
  if (!live.authenticated) {
    redirect("/login?callbackUrl=%2Fsongs%2Fnew");
  }
  if (!canEditSongs(live.roles)) {
    return <AccessDeniedView />;
  }

  const { title, artist, tagIds } = await searchParams;
  const defaultTagIds = tagIds
    ? tagIds.split(",").map(Number).filter(Boolean)
    : [];

  return (
    <ClientArrangementFormPage
      defaultMeta={{ title: title ?? "", artist: artist ?? null }}
      defaultTagIds={defaultTagIds}
    />
  );
}
