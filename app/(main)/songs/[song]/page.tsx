import ClientPage from "./ClientPage";

export default async function SongPage({
  params,
  searchParams,
}: {
  params: Promise<{ song: string }>;
  searchParams?: Promise<{ arrangement?: number }>;
}) {
  const { song: songSlug } = await params;
  const arrangementId = (await searchParams)?.arrangement;

  return <ClientPage songSlug={songSlug} arrangementId={arrangementId} />;
}
