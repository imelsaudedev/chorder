import ClientArrangementFormPage from "../ClientArrangementFormPage";

export default async function NewSongPage({
  searchParams,
}: {
  searchParams: Promise<{ title?: string; artist?: string }>;
}) {
  const { title, artist } = await searchParams;

  return (
    <ClientArrangementFormPage
      defaultMeta={{ title: title ?? "", artist: artist ?? null }}
    />
  );
}
