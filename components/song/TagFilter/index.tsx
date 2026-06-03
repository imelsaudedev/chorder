"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ClientTagGroup } from "@/prisma/models";
import { Check, ChevronDown, X } from "lucide-react";

type TagFilterProps = {
  tagGroups: ClientTagGroup[];
  selectedTagIds: number[];
  onChange: (tagIds: number[]) => void;
};

export default function TagFilter({
  tagGroups,
  selectedTagIds,
  onChange,
}: TagFilterProps) {
  if (tagGroups.length === 0) return null;

  const selectedSet = new Set(selectedTagIds);

  function toggleTag(tagId: number) {
    if (selectedSet.has(tagId)) {
      onChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  }

  function clearAll() {
    onChange([]);
  }

  const activeChips = tagGroups
    .flatMap((g) => g.tags.map((t) => ({ ...t, group: g })))
    .filter((t) => selectedSet.has(t.id));

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tagGroups.map((group) => (
        <Popover key={group.id}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
              style={
                group.tags.some((t) => selectedSet.has(t.id))
                  ? { borderColor: group.color, color: group.color }
                  : {}
              }
            >
              {group.name}
              <ChevronDown className="w-3 h-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-1" align="start">
            {group.tags.map((tag) => {
              const isSelected = selectedSet.has(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-sm rounded hover:bg-muted transition-colors"
                >
                  <span>{tag.name}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    {tag.songCount !== undefined && (
                      <span className="text-xs text-muted-foreground">{tag.songCount}</span>
                    )}
                    {isSelected && (
                      <Check className="w-3.5 h-3.5" style={{ color: group.color }} />
                    )}
                  </div>
                </button>
              );
            })}
          </PopoverContent>
        </Popover>
      ))}

      {activeChips.map((tag) => (
        <span
          key={tag.id}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
          style={{
            backgroundColor: `${tag.group.color}26`,
            color: tag.group.color,
            border: `1px solid ${tag.group.color}4d`,
          }}
        >
          {tag.name}
          <button
            type="button"
            onClick={() => toggleTag(tag.id)}
            className="hover:opacity-70 transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      {selectedTagIds.length > 0 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-muted-foreground"
          onClick={clearAll}
        >
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
