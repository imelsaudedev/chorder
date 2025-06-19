import Main from "@components/Main";
import ArrangementViewer from "../ArrangementViewer";
import ArrangementViewContext, {
  useDensity,
} from "../ArrangementViewer/ArrangementViewContext";
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
      <MainWithDensity>
        <ArrangementViewer />
      </MainWithDensity>
    </ArrangementViewContext>
  );
}

function MainWithDensity({ children }: { children: React.ReactNode }) {
  const { density } = useDensity();

  return (
    <Main density={density} className="py-4 sm:py-6 lg:py-8">
      {children}
    </Main>
  );
}
