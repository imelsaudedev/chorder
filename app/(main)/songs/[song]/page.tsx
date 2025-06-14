import ArrangementViewer from "../ArrangementViewer";
import ArrangementViewContext from "../ArrangementViewer/ArrangementViewContext";
import ArrangementViewerHeader from "../ArrangementViewer/ArrangementViewerHeader";

export default async function SongPage({
  params,
  searchParams,
}: {
  params: { song: string };
  searchParams?: { arrangement?: number };
}) {
  const { song: songSlug } = await params;
  const arrangementId = (await searchParams)?.arrangement;

  return (
    <ArrangementViewContext songSlug={songSlug} arrangementId={arrangementId}>
      <ArrangementViewerHeader />
      <ArrangementViewer />
    </ArrangementViewContext>
  );
}
