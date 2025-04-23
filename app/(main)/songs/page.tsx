import Heading from "@/components/Heading";
import Main from "@/components/Main";
import { Plus, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import SongList, { SongListSkeleton } from "./SongList";
import SearchBar from "./SearchBar";
import { Suspense } from "react";

type SongListPageProps = {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
};

export default async function SongListPage(props: SongListPageProps) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";

  return (
    <>
      <div className="flex flex-col flex-grow justify-between gap-4 px-4 sm:px-12 lg:px-16 pt-8 sm:pt-12 lg:pt-16 pb-4 sm:pb-6 lg:pb-8">
        <Heading level={1} className="flex items-center gap-2">
          <Music className="w-8 lg:w-10 h-8 lg:h-10" />
          Músicas
        </Heading>
      </div>

      <Main>
        <div className="sm:px-6 lg:px-8">
          <div className="mb-4">
            <SearchBar />
          </div>
          <Suspense fallback={<SongListSkeleton />}>
            <SongList query={query} />
          </Suspense>
        </div>
      </Main>

      {/* Botão flutuante */}
      <div className="fixed bottom-24 right-4 sm:bottom-8 sm:right-8">
        <Button
          asChild
          variant="secondary"
          size="square"
          rounded="full"
          className="shadow-lg"
        >
          <Link href="./songs/new" className="flex items-center gap-1 sm:pr-6">
            <Plus />
            <span className="hidden sm:inline">Nova música</span>
          </Link>
        </Button>
      </div>

      <ScrollToTopButton />
    </>
  );
}
