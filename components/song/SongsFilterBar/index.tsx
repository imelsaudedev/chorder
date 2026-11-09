"use client";

import { SongSort } from "@/lib/songs-list-state";
import { ClientTagGroup } from "@/prisma/models";
import CategoryPicker from "./CategoryPicker";
import ExpandingSearch from "./ExpandingSearch";
import LettersGrid from "./LettersGrid";
import SortMenu from "./SortMenu";

type SongsFilterBarProps = {
  tagGroups: ClientTagGroup[];
  selectedTagIds: number[];
  onTagsChange: (tagIds: number[]) => void;
  query: string;
  onQueryChange: (query: string) => void;
  sort: SongSort;
  onSortChange: (sort: SongSort) => void;
};

/**
 * Bloco de filtros da lista de Músicas. Desktop: uma linha (seletores à esquerda; lupa,
 * letras e ordenação à direita). Celular: duas linhas — categorias com rolagem lateral
 * e, embaixo, lupa, letras e ordenação.
 */
export default function SongsFilterBar({
  tagGroups,
  selectedTagIds,
  onTagsChange,
  query,
  onQueryChange,
  sort,
  onSortChange,
}: SongsFilterBarProps) {
  const selectedGroupName = tagGroups.find((g) => g.tags.some((t) => selectedTagIds.includes(t.id)))?.name;
  const placeholder = selectedGroupName
    ? `Buscar em ${
        tagGroups
          .flatMap((g) => g.tags)
          .filter((t) => selectedTagIds.includes(t.id))
          .map((t) => t.name)
          .join(", ")
      }`
    : "Buscar músicas";

  const pickers = tagGroups.map((group) => (
    <CategoryPicker key={group.id} group={group} selectedTagIds={selectedTagIds} onChange={onTagsChange} />
  ));

  const tools = (
    <>
      <ExpandingSearch value={query} placeholder={placeholder} onSearch={onQueryChange} />
      {sort.key === "title" && <LettersGrid />}
      <SortMenu sort={sort} onChange={onSortChange} />
    </>
  );

  return (
    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 no-scrollbar sm:mx-0 sm:flex-1 sm:flex-wrap sm:overflow-visible sm:px-0">
        {pickers}
      </div>
      <div className="flex items-center gap-2 sm:ml-auto sm:justify-end">{tools}</div>
    </div>
  );
}
