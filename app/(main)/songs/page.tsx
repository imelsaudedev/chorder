import Heading from "@/components/common/Heading";
import Main from "@/components/common/Main";
import ScrollToTopButton from "@/components/common/ScrollToTopButton";
import UrlSearchBar from "@/components/common/SearchBar/UrlSearchBar";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import ClientSongsPage from "./ClientSongsPage";

type SongListPageProps = {
  searchParams?: Promise<{ query?: string }>;
};

export default async function SongListPage(props: SongListPageProps) {
  const t = await getTranslations();
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";

  return (
    <>
      <div className="flex items-center justify-between px-5 sm:px-8 lg:px-14 pt-6 sm:pt-8 pb-4 sm:pb-6 lg:pb-8 max-w-full">
        <Heading level={1}>
          {t("Messages.songs")}
        </Heading>
        <Image src="/logo_amanhar.webp" alt="Amanhar" width={120} height={120} priority className="h-20 w-auto" />
      </div>

      <Main className="max-w-full">
        <div className="mb-4">
          <UrlSearchBar />
        </div>
        <ClientSongsPage query={query} />
      </Main>

      <ScrollToTopButton />
    </>
  );
}
