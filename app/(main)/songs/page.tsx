import LogoHeader from "@/components/common/LogoHeader";
import Heading from "@/components/common/Heading";
import Main from "@/components/common/Main";
import ScrollToTopButton from "@/components/common/ScrollToTopButton";
import UrlSearchBar from "@/components/common/SearchBar/UrlSearchBar";
import { getTranslations } from "next-intl/server";
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
      <LogoHeader />

      <div className="flex flex-col grow justify-between gap-4 px-5 sm:px-8 lg:px-14 pt-0 pb-4 sm:pb-6 lg:pb-8 max-w-full">
        <Heading level={1} className="pt-9">
          {t("Messages.songs")}
        </Heading>
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
