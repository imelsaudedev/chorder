"use client";

import { Button } from "@/components/ui/button";
import { ClientTagGroup } from "@/prisma/models";
import { SlidersHorizontal, X } from "lucide-react";

// Filtros por tag para o seletor de músicas compacto. Três peças:
//  - FiltersToggle: botão ao lado da busca, com a contagem de filtros ativos;
//  - ActiveFilterChips: filtros ativos como chips removíveis (cor do grupo);
//  - FiltersPanel: painel com um bloco por grupo e as tags como botões de alternância.
// A regra do servidor é OU dentro do mesmo grupo e E entre grupos diferentes.

export function FiltersToggle({
  activeCount,
  open,
  onToggle,
}: {
  activeCount: number;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onToggle}
      aria-expanded={open}
      aria-label={activeCount > 0 ? `Filtros, ${activeCount} ativos` : "Filtros"}
      className="h-11 shrink-0 gap-1.5 rounded-full px-3.5"
    >
      <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
      {activeCount > 0 && (
        <span className="flex size-5 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
          {activeCount}
        </span>
      )}
    </Button>
  );
}

export function ActiveFilterChips({
  tagGroups,
  selectedTagIds,
  onRemove,
}: {
  tagGroups: ClientTagGroup[];
  selectedTagIds: number[];
  onRemove: (tagId: number) => void;
}) {
  const selected = new Set(selectedTagIds);
  const chips = tagGroups
    .flatMap((group) => group.tags.map((tag) => ({ tag, group })))
    .filter(({ tag }) => selected.has(tag.id));

  if (chips.length === 0) return null;

  return (
    <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Filtros ativos">
      {chips.map(({ tag, group }) => (
        <li key={tag.id}>
          <button
            type="button"
            onClick={() => onRemove(tag.id)}
            aria-label={`Remover filtro ${tag.name}`}
            className="cursor-pointer inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            style={{
              backgroundColor: `${group.color}26`,
              color: group.color,
              borderColor: `${group.color}4d`,
            }}
          >
            {tag.name}
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  );
}

export function FiltersPanel({
  tagGroups,
  selectedTagIds,
  onToggleTag,
  onClear,
}: {
  tagGroups: ClientTagGroup[];
  selectedTagIds: number[];
  onToggleTag: (tagId: number) => void;
  onClear: () => void;
}) {
  const selected = new Set(selectedTagIds);
  const groups = tagGroups.filter((group) => group.tags.length > 0);

  if (groups.length === 0) {
    return <p className="mt-3 text-sm text-muted-foreground">Nenhuma tag cadastrada.</p>;
  }

  return (
    <div className="mt-3 max-h-[40dvh] overflow-y-auto rounded-lg border border-border p-3">
      <div className="flex flex-col gap-4">
        {groups.map((group) => (
          <fieldset key={group.id} className="min-w-0">
            <legend className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <span
                aria-hidden="true"
                className="size-2 rounded-full"
                style={{ backgroundColor: group.color }}
              />
              {group.name}
            </legend>
            <div className="flex flex-wrap gap-1.5">
              {group.tags.map((tag) => {
                const isSelected = selected.has(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => onToggleTag(tag.id)}
                    className="cursor-pointer inline-flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    style={
                      isSelected
                        ? {
                            backgroundColor: `${group.color}26`,
                            color: group.color,
                            borderColor: group.color,
                          }
                        : undefined
                    }
                  >
                    {tag.name}
                    {tag.songCount !== undefined && (
                      <span className="text-xs font-normal opacity-70">{tag.songCount}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>
      {selectedTagIds.length > 0 && (
        <Button
          type="button"
          variant="ghost"
          onClick={onClear}
          className="mt-3 h-10 px-2 text-muted-foreground"
        >
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
