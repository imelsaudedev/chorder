"use client";

import { useFetchTagGroups } from "@/app/api/api-client";
import CoverHero from "@/components/song/Cover/CoverHero";
import ClientSongList from "@/components/song/SongList/ClientSongList";
import SongsFilterBar from "@/components/song/SongsFilterBar";
import { readStorage, writeStorage } from "@/hooks/useLocalStorageState";
import useSongsListState from "@/hooks/useSongsListState";
import { SongSort } from "@/lib/songs-list-state";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

const SORT_STORAGE_KEY = "musicas:sort";

/** Página de uma categoria: capa de cor + os filtros e a lista, já restritos à categoria. */
export default function ClientCategoryPage({ tagId }: { tagId: number }) {
  const { tagGroups, isLoading } = useFetchTagGroups();
  const { query, tagIds, setTagIds, sort, setSort, setQuery } = useSongsListState();
  const searchParams = useSearchParams();

  // A ordenação escolhida fica lembrada no aparelho; a URL, quando traz uma, manda.
  useEffect(() => {
    if (searchParams.has("sort")) return;
    const saved = readStorage<SongSort | null>(SORT_STORAGE_KEY, null);
    if (saved) setSort(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const group = tagGroups.find((g) => g.tags.some((t) => t.id === tagId));
  const tag = group?.tags.find((t) => t.id === tagId);

  if (isLoading) return <div className="h-[164px] animate-pulse rounded-lg bg-muted/30" />;
  if (!group || !tag) {
    return <p className="py-16 text-center text-muted-foreground">Categoria não encontrada.</p>;
  }

  return (
    <>
      <CoverHero
        groupName={group.name}
        name={tag.name}
        description={tag.description}
        color={tag.color ?? group.color}
        backHref="/songs"
      />
      <SongsFilterBar
        // os demais grupos viram seletores; o próprio grupo da categoria já está aplicado
        tagGroups={tagGroups.filter((g) => g.id !== group.id)}
        selectedTagIds={tagIds}
        onTagsChange={setTagIds}
        query={query}
        onQueryChange={setQuery}
        sort={sort}
        onSortChange={(next) => {
          writeStorage(SORT_STORAGE_KEY, next);
          setSort(next);
        }}
        scopeLabel={tag.name}
      />
      <ClientSongList query={query} tagIds={[tag.id, ...tagIds]} sort={sort} />
    </>
  );
}
