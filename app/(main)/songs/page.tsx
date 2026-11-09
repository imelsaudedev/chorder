import Heading from "@/components/common/Heading";
import Main from "@/components/common/Main";
import ScrollToTopButton from "@/components/common/ScrollToTopButton";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import ClientSongsPage from "./ClientSongsPage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Messages");
  return { title: t("songs") };
}

type SongListPageProps = {
  searchParams?: Promise<{ query?: string; v?: string }>;
};

export default async function SongListPage(props: SongListPageProps) {
  const t = await getTranslations();
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";

  return (
    <>
      <div className="px-5 sm:px-8 lg:px-14 pt-6 sm:pt-8 pb-4 sm:pb-6 lg:pb-8 max-w-full">
        <Heading level={1}>
          {t("Messages.songs")}
        </Heading>
      </div>

      <Main className="max-w-full">
        <ClientSongsPage query={query} home={searchParams?.v === "2"} />
      </Main>

      <ScrollToTopButton />
    </>
  );
}
