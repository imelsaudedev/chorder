import FloatingAddLink from "@/components/common/FloatingAddLink";
import Heading from "@/components/common/Heading";
import Main from "@/components/common/Main";
import ScrollToTopButton from "@/components/common/ScrollToTopButton";
import UrlSearchBar from "@/components/common/SearchBar/UrlSearchBar";
import ClientSongList from "@/components/song/SongList/ClientSongList";
import { Music } from "lucide-react";
import { getTranslations } from "next-intl/server";

type SongListPageProps = {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
};

export default async function SongListPage(props: SongListPageProps) {
  const t = await getTranslations();
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";

  return (
    <>
      <div className="flex flex-col grow justify-between gap-4 px-4 sm:px-12 lg:px-16 pt-8 sm:pt-12 lg:pt-16 pb-4 sm:pb-6 lg:pb-8 max-w-full">
        <Heading level={1} className="flex items-center gap-2">
          <Music className="w-8 lg:w-10 h-8 lg:h-10" />
          {t("Messages.songs")}
        </Heading>
      </div>

      <Main className="max-w-full">
        <div className="mb-4">
          <UrlSearchBar />
        </div>
        <ClientSongList query={query} />
      </Main>

      <FloatingAddLink href="./songs/new" label={t("Messages.newSong")} />

      <ScrollToTopButton />
    </>
  );
}
