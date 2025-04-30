import ArrangementViewer from "../ArrangementViewer";
import ArrangementViewContext from "../ArrangementViewer/ArrangementViewContext";
import ArrangementViewerHeader from "../ArrangementViewer/ArrangementViewerHeader";

export default async function SongPage({
  params,
}: {
  params: { song: string };
  searchParams: { arrangement?: string };
}) {
  const { song: songSlug } = await params;

  return (
    <ArrangementViewContext songSlug={songSlug}>
      <ArrangementViewerHeader />
      <ArrangementViewer />
    </ArrangementViewContext>
  );
}
