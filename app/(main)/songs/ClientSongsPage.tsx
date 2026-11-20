"use client";

import { useFetchTagGroups } from "@/app/api/api-client";
import FloatingAddLink from "@/components/common/FloatingAddLink";
import SongsHome from "@/components/song/Cover/SongsHome";
import SongsFilterBar from "@/components/song/SongsFilterBar";
import ClientSongList from "@/components/song/SongList/ClientSongList";
import { readStorage, writeStorage } from "@/hooks/useLocalStorageState";
import { useNewSong } from "./NewSongProvider";
import useSongsListState from "@/hooks/useSongsListState";
import { SongSort } from "@/lib/songs-list-state";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

const SORT_STORAGE_KEY = "musicas:sort";

type ClientSongsPageProps = { query: string };

export default function ClientSongsPage({ query }: ClientSongsPageProps) {
  const t = useTranslations("Messages");
  const { openNewSong } = useNewSong();
  // Categorias e ordenação ficam na URL: ao abrir uma música e voltar, a lista retoma como estava.
  const { tagIds: selectedTagIds, setTagIds: setSelectedTagIds, sort, setSort, setQuery } = useSongsListState();
  const searchParams = useSearchParams();

  // A ordenação escolhida fica lembrada no aparelho; a URL, quando traz uma, manda.
  useEffect(() => {
    if (searchParams.has("sort")) return;
    const saved = readStorage<SongSort | null>(SORT_STORAGE_KEY, null);
    if (saved) setSort(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function changeSort(next: SongSort) {
    writeStorage(SORT_STORAGE_KEY, next);
    setSort(next);
  }
  const { tagGroups } = useFetchTagGroups();

  return (
    <>
      <SongsHome tagGroups={tagGroups} />
      <SongsFilterBar
        tagGroups={tagGroups}
        selectedTagIds={selectedTagIds}
        onTagsChange={setSelectedTagIds}
        query={query}
        onQueryChange={setQuery}
        sort={sort}
        onSortChange={changeSort}
      />
      <ClientSongList query={query} tagIds={selectedTagIds} sort={sort} />

      {/* No tablet e no desktop a ação está no cabeçalho. */}
      <FloatingAddLink label={t("newSong")} onClick={openNewSong} mobileOnly />
    </>
  );
}
