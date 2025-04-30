import Heading from "@components/Heading";
import SongList from "@components/SongList";
import Main from "@/components/Main";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { Button } from "@ui/button";
import { Music, Plus } from "lucide-react";
import Link from "next/link";
import SearchBar from "./SearchBar";

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
      <div className="flex flex-col grow justify-between gap-4 px-4 sm:px-12 lg:px-16 pt-8 sm:pt-12 lg:pt-16 pb-4 sm:pb-6 lg:pb-8">
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
          <SongList query={query} />
        </div>
      </Main>

      {/* Botão flutuante */}
      <div className="fixed bottom-24 right-4 sm:bottom-8 sm:right-8">
        <Button asChild variant="secondary" className="shadow-lg rounded-full">
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
