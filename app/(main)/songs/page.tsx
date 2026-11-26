import Main from "@/components/common/Main";
import PageTitleBlock from "@/components/common/PageTitleBlock";
import ScrollToTopButton from "@/components/common/ScrollToTopButton";
import { getLiveUserAuth } from "@/lib/auth-guard";
import { canEditSongs } from "@/lib/permissions";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ClientSongsPage from "./ClientSongsPage";
import NewSongProvider from "./NewSongProvider";
import SongsHeaderActions from "./SongsHeaderActions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Messages");
  return { title: t("songs") };
}

type SongListPageProps = {
  searchParams?: Promise<{ query?: string }>;
};

export default async function SongListPage(props: SongListPageProps) {
  const [t, searchParams, live] = await Promise.all([
    getTranslations(),
    props.searchParams,
    getLiveUserAuth(),
  ]);
  const query = searchParams?.query || "";
  const canEdit = canEditSongs(live.roles);

  return (
    <NewSongProvider>
      <PageTitleBlock
        title={t("Messages.songs")}
        actions={canEdit ? <SongsHeaderActions /> : undefined}
      />

      <Main className="max-w-full">
        <ClientSongsPage query={query} canEdit={canEdit} />
      </Main>

      <ScrollToTopButton />
    </NewSongProvider>
  );
}
