"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClientTag, ClientTagGroup } from "@/prisma/models";
import { Check, ChevronDown, X } from "lucide-react";
import { useState } from "react";

type TagSelectProps = {
  value: ClientTag[];
  tagGroups: ClientTagGroup[];
  onChange: (tags: ClientTag[]) => void;
};

export default function TagSelect({ value, tagGroups, onChange }: TagSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedIds = new Set(value.map((t) => t.id));

  function toggleTag(tag: Pick<ClientTag, "id" | "name">, group: ClientTagGroup) {
    if (selectedIds.has(tag.id)) {
      onChange(value.filter((t) => t.id !== tag.id));
    } else {
      onChange([...value, { id: tag.id, name: tag.name, group: { id: group.id, name: group.name, color: group.color } }]);
    }
  }

  function removeTag(tagId: number) {
    onChange(value.filter((t) => t.id !== tagId));
  }

  const filteredGroups = tagGroups
    .map((group) => ({
      ...group,
      tags: group.tags.filter((tag) =>
        tag.name.toLowerCase().includes(query.toLowerCase())
      ),
    }))
    .filter((group) => group.tags.length > 0);

  return (
    <div className="flex flex-col gap-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((tag) => (
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
                onClick={() => removeTag(tag.id)}
                className="hover:opacity-70 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        className="w-full justify-between font-normal text-muted-foreground"
        onClick={() => setOpen((o) => !o)}
      >
        {value.length === 0 ? "Adicionar tags..." : `${value.length} tag${value.length > 1 ? "s" : ""} selecionada${value.length > 1 ? "s" : ""}`}
        <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </Button>

      {open && (
        <div className="border rounded-md overflow-hidden">
          <div className="p-2 border-b">
            <Input
              placeholder="Filtrar tags..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredGroups.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Nenhuma tag encontrada.</p>
            ) : (
              filteredGroups.map((group) => (
                <div key={group.id}>
                  <div
                    className="px-3 py-1.5 text-xs font-semibold"
                    style={{ color: group.color }}
                  >
                    {group.name}
                  </div>
                  {group.tags.map((tag) => {
                    const isSelected = selectedIds.has(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag, group)}
                        className="w-full flex items-center justify-between px-3 py-1.5 text-sm hover:bg-muted transition-colors"
                      >
                        <span>{tag.name}</span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 shrink-0" style={{ color: group.color }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
