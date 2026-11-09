"use client";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { ClientTagGroup } from "@/prisma/models";
import { Check, ChevronDown, X } from "lucide-react";
import { useState } from "react";

type CategoryPickerProps = {
  group: ClientTagGroup;
  selectedTagIds: number[];
  onChange: (tagIds: number[]) => void;
};

/**
 * Seletor de um grupo de categorias. Fundo suave; o filtro aplicado aparece dentro do
 * seletor, com ✕. Nas telas maiores abre um menu; no celular, uma folha de baixo.
 * O filtro vale ao vivo (sem botão "aplicar").
 */
export default function CategoryPicker({ group, selectedTagIds, onChange }: CategoryPickerProps) {
  const [open, setOpen] = useState(false);
  const isMobile = !useMediaQuery("(min-width: 640px)");

  const groupIds = new Set(group.tags.map((t) => t.id));
  const selectedHere = group.tags.filter((t) => selectedTagIds.includes(t.id));
  const active = selectedHere.length > 0;
  const single = group.selection === "SINGLE";

  function toggle(tagId: number) {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter((id) => id !== tagId));
      return;
    }
    const base = single ? selectedTagIds.filter((id) => !groupIds.has(id)) : selectedTagIds;
    onChange([...base, tagId]);
    if (single) setOpen(false);
  }

  function clearGroup() {
    onChange(selectedTagIds.filter((id) => !groupIds.has(id)));
  }

  const label = active
    ? selectedHere.length === 1
      ? selectedHere[0].name
      : `${group.name} · ${selectedHere.length}`
    : group.name;

  const options = (
    <div className="flex flex-col">
      {group.tags.map((tag) => {
        const isSelected = selectedTagIds.includes(tag.id);
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => toggle(tag.id)}
            className="flex min-h-10 w-full items-center justify-between gap-2 rounded px-3 py-1.5 text-left text-sm transition-colors hover:bg-muted"
          >
            <span className="truncate">{tag.name}</span>
            <span className="flex shrink-0 items-center gap-1.5">
              {tag.songCount !== undefined && (
                <span className="text-xs tabular-nums text-muted-foreground">{tag.songCount}</span>
              )}
              {isSelected && <Check className="size-3.5" style={{ color: group.color }} />}
            </span>
          </button>
        );
      })}
    </div>
  );

  // Botão e ✕ são irmãos (botão dentro de botão é inválido).
  const trigger = (
    <Button
      type="button"
      variant="soft"
      size="sm"
      className={active ? "pr-7" : undefined}
      style={active ? { backgroundColor: `${group.color}26`, color: group.color } : undefined}
      aria-haspopup="dialog"
    >
      <span className="max-w-40 truncate">{label}</span>
      {!active && <ChevronDown className="size-3.5" />}
    </Button>
  );

  return (
    <span className="relative inline-flex shrink-0">
      {isMobile ? (
        <>
          <span onClick={() => setOpen(true)} className="inline-flex">
            {trigger}
          </span>
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>{group.name}</DrawerTitle>
              </DrawerHeader>
              <div className="max-h-[60vh] overflow-y-auto px-2 pb-6">{options}</div>
            </DrawerContent>
          </Drawer>
        </>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>{trigger}</PopoverTrigger>
          <PopoverContent className="w-60 p-1" align="start">
            {options}
          </PopoverContent>
        </Popover>
      )}
      {active && (
        <button
          type="button"
          onClick={clearGroup}
          aria-label={`Limpar ${group.name}`}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 hover:opacity-70"
          style={{ color: group.color }}
        >
          <X className="size-3" />
        </button>
      )}
    </span>
  );
}
