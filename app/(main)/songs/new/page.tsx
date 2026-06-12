import ClientArrangementFormPage from "../ClientArrangementFormPage";

export default async function NewSongPage({
  searchParams,
}: {
  searchParams: Promise<{ title?: string; artist?: string; tagIds?: string }>;
}) {
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
