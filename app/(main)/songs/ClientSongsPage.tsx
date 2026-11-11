"use client";

import { useFetchTagGroups } from "@/app/api/api-client";
import FloatingAddLink from "@/components/common/FloatingAddLink";
import SongsHome from "@/components/song/Cover/SongsHome";
import SongsFilterBar from "@/components/song/SongsFilterBar";
import SongMetaModal from "@/components/song/SongMetaModal";
import ClientSongList from "@/components/song/SongList/ClientSongList";
import { readStorage, writeStorage } from "@/hooks/useLocalStorageState";
import useSongsListState from "@/hooks/useSongsListState";
import { SongSort } from "@/lib/songs-list-state";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const SORT_STORAGE_KEY = "musicas:sort";

type ClientSongsPageProps = { query: string };

export default function ClientSongsPage({ query }: ClientSongsPageProps) {
  const t = useTranslations("Messages");
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
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

      <FloatingAddLink label={t("newSong")} onClick={() => setModalOpen(true)} />

      <SongMetaModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        loading={isNavigating}
        isNew
        onSave={(values) => {
          const params = new URLSearchParams();
          params.set("title", values.title.trim());
          if (values.artist) params.set("artist", values.artist.trim());
          if (values.tagIds?.length) params.set("tagIds", values.tagIds.join(","));
          setIsNavigating(true);
          setTimeout(() => router.push(`/songs/new?${params.toString()}`), 0);
          return false;
        }}
      />
    </>
  );
}
