import PageTitleBlock from "@/components/common/PageTitleBlock";
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
  searchParams?: Promise<{ query?: string }>;
};

export default async function SongListPage(props: SongListPageProps) {
  const t = await getTranslations();
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";

  return (
    <>
      <PageTitleBlock title={t("Messages.songs")} />

      <Main className="max-w-full">
        <ClientSongsPage query={query} />
      </Main>

      <ScrollToTopButton />
    </>
  );
}
