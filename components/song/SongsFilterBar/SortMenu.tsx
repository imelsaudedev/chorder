"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SORT_KEYS, SongSort, SongSortKey, defaultDir } from "@/lib/songs-list-state";
import { ArrowDown, ArrowUp } from "lucide-react";

export const SORT_LABELS: Record<SongSortKey, string> = {
  title: "Título",
  usage: "Uso em liturgias",
  artist: "Compositor",
};

type SortMenuProps = { sort: SongSort; onChange: (sort: SongSort) => void };

/** Ordenação: a seta indica o sentido; tocar de novo no mesmo item inverte. */
export default function SortMenu({ sort, onChange }: SortMenuProps) {
  const Arrow = sort.dir === "asc" ? ArrowUp : ArrowDown;

  function pick(key: SongSortKey) {
    if (key === sort.key) onChange({ key, dir: sort.dir === "asc" ? "desc" : "asc" });
    else onChange({ key, dir: defaultDir(key) });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="soft" size="sm" aria-label="Ordenar">
          <Arrow className="size-3.5" />
          {SORT_LABELS[sort.key]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SORT_KEYS.map((key) => (
          <DropdownMenuItem
            key={key}
            onSelect={(e) => {
              e.preventDefault();
              pick(key);
            }}
            className="justify-between gap-6"
          >
            {SORT_LABELS[key]}
            {key === sort.key && <Arrow className="size-3.5" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
