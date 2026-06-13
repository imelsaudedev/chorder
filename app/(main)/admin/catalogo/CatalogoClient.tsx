"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Tag = { id: number; name: string; group: { id: number; name: string; color: string } };
type TagGroup = { id: number; name: string; color: string; tags: { id: number; name: string }[] };
type CatalogSong = {
  id: number;
  slug: string;
  title: string;
  artist: string | null;
  lyrics: string;
  legacyId: number | null;
  tags: Tag[];
};
type Props = { songs: CatalogSong[]; tagGroups: TagGroup[] };

function colCount(tagGroups: TagGroup[]) {
  // checkbox + título + compositor + tagGroups + expand
  return 3 + tagGroups.length;
}

function focusCell(row: number, col: number) {
  const input = document.querySelector<HTMLElement>(
    `td[data-row="${row}"][data-col="${col}"] input`
  );
  input?.focus();
}

function stripChords(lyrics: string): string {
  // Remove ChordPro inline chords like [Am], [G/B], [C#m7], etc.
  return lyrics
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\{[^}]*\}/g, "")  // remove directives like {start_of_chorus}
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .join("\n");
}

export default function CatalogoClient({ songs: initialSongs, tagGroups }: Props) {
  const [songs, setSongs] = useState<CatalogSong[]>(initialSongs);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [bulkTagGroupId, setBulkTagGroupId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const filtered = search
    ? songs.filter(
        (s) =>
          s.title.toLowerCase().includes(search.toLowerCase()) ||
          s.artist?.toLowerCase().includes(search.toLowerCase())
      )
    : songs;

  const allSelected = filtered.length > 0 && filtered.every((s) => selected.has(s.slug));
  const someSelected = selected.size > 0;

  function toggleAll() {
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((s) => next.delete(s.slug));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((s) => next.add(s.slug));
        return next;
      });
    }
  }

  function toggleOne(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });
  }

  function toggleExpand(slug: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });
  }

  async function patchSong(slug: string, data: { title?: string; artist?: string | null; tagIds?: number[] }) {
    const res = await fetch(`/api/songs/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) return;
    setSongs((prev) =>
      prev.map((s) => {
        if (s.slug !== slug) return s;
        const next = { ...s };
        if (data.title !== undefined) next.title = data.title;
        if (data.artist !== undefined) next.artist = data.artist;
        if (data.tagIds !== undefined) {
          const tagMap = new Map<number, Tag>();
          for (const g of tagGroups)
            for (const t of g.tags)
              tagMap.set(t.id, { id: t.id, name: t.name, group: { id: g.id, name: g.name, color: g.color } });
          next.tags = data.tagIds.flatMap((id) => (tagMap.get(id) ? [tagMap.get(id)!] : []));
        }
        return next;
      })
    );
  }

  function handleTagGroupUpdate(song: CatalogSong, groupId: number, newGroupTagIds: number[]) {
    const otherTagIds = song.tags.filter((t) => t.group.id !== groupId).map((t) => t.id);
    patchSong(song.slug, { tagIds: [...otherTagIds, ...newGroupTagIds] });
  }

  async function bulkDelete() {
    const slugs = [...selected].filter((s) => filtered.some((f) => f.slug === s));
    await Promise.all(
      slugs.map((slug) =>
        fetch(`/api/songs/${slug}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isDeleted: true }),
        })
      )
    );
    setSongs((prev) => prev.filter((s) => !slugs.includes(s.slug)));
    setSelected(new Set());
    setConfirmDelete(false);
  }

  async function bulkSetTag(groupId: number, tagId: number | null) {
    const slugs = [...selected].filter((s) => filtered.some((f) => f.slug === s));
    const group = tagGroups.find((g) => g.id === groupId);
    if (!group) return;

    await Promise.all(
      slugs.map((slug) => {
        const song = songs.find((s) => s.slug === slug);
        if (!song) return;
        const otherTagIds = song.tags.filter((t) => t.group.id !== groupId).map((t) => t.id);
        const newIds = tagId ? [...otherTagIds, tagId] : otherTagIds;
        return patchSong(slug, { tagIds: newIds });
      })
    );
    setBulkTagGroupId(null);
  }

  function handleTableKeyDown(e: React.KeyboardEvent, totalRows: number) {
    const td = (e.target as HTMLElement).closest("td[data-row]") as HTMLElement | null;
    if (!td) return;
    const row = parseInt(td.dataset.row ?? "-1");
    const col = parseInt(td.dataset.col ?? "-1");
    if (row === -1 || col === -1) return;
    const cols = colCount(tagGroups);

    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      const nextCol = col + 1 < cols ? col + 1 : 0;
      const nextRow = col + 1 < cols ? row : row + 1;
      if (nextRow < totalRows) focusCell(nextRow, nextCol);
    } else if (e.key === "Tab" && e.shiftKey) {
      e.preventDefault();
      const prevCol = col - 1 >= 0 ? col - 1 : cols - 1;
      const prevRow = col - 1 >= 0 ? row : row - 1;
      if (prevRow >= 0) focusCell(prevRow, prevCol);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (row + 1 < totalRows) focusCell(row + 1, col);
    }
  }

  const selectedCount = [...selected].filter((s) => filtered.some((f) => f.slug === s)).length;

  return (
    <div className="pb-16">
      {/* Toolbar */}
      <div className="mb-4 flex items-center gap-3 flex-wrap">
        <Input
          placeholder="Filtrar por título ou compositor…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 text-sm max-w-sm"
        />

        {someSelected && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-muted-foreground">{selectedCount} selecionada{selectedCount !== 1 ? "s" : ""}</span>

            {/* Bulk tag */}
            <div className="relative">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => setBulkTagGroupId(bulkTagGroupId ? null : tagGroups[0]?.id ?? null)}
              >
                Alterar tag
              </Button>
              {bulkTagGroupId !== null && (
                <div className="absolute top-full right-0 mt-1 z-50 bg-background border border-border rounded-md shadow-lg p-3 min-w-[220px]">
                  <div className="flex gap-1 mb-2 flex-wrap">
                    {tagGroups.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setBulkTagGroupId(g.id)}
                        className={cn(
                          "px-2 py-0.5 rounded text-xs font-medium border transition-colors",
                          bulkTagGroupId === g.id
                            ? "text-white"
                            : "text-muted-foreground border-transparent"
                        )}
                        style={bulkTagGroupId === g.id ? { backgroundColor: g.color, borderColor: g.color } : {}}
                      >
                        {g.name}
                      </button>
                    ))}
                  </div>
                  {(() => {
                    const g = tagGroups.find((x) => x.id === bulkTagGroupId);
                    if (!g) return null;
                    return (
                      <div className="space-y-0.5">
                        <button
                          type="button"
                          onClick={() => bulkSetTag(g.id, null)}
                          className="w-full text-left px-2 py-1 text-xs text-muted-foreground hover:bg-muted rounded"
                        >
                          Remover tag
                        </button>
                        {g.tags.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => bulkSetTag(g.id, t.id)}
                            className="w-full text-left px-2 py-1 text-xs hover:bg-muted rounded"
                          >
                            {t.name}
                          </button>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Bulk delete */}
            {confirmDelete ? (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-destructive">Confirmar exclusão?</span>
                <Button type="button" variant="destructive" size="sm" className="h-7 text-xs" onClick={bulkDelete}>
                  Excluir
                </Button>
                <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setConfirmDelete(false)}>
                  Cancelar
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 size={13} className="mr-1" />
                Excluir
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-xs text-muted-foreground uppercase tracking-wide">
              <th className="px-3 py-2.5 w-8">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="rounded"
                />
              </th>
              <th className="px-4 py-2.5 text-left font-medium w-[25%]">Título</th>
              <th className="px-4 py-2.5 text-left font-medium w-[18%]">Compositor</th>
              {tagGroups.map((g) => (
                <th key={g.id} className="px-4 py-2.5 text-left font-medium whitespace-nowrap">
                  <span style={{ color: g.color }}>{g.name}</span>
                </th>
              ))}
              <th className="w-8" />
            </tr>
          </thead>
          <tbody
            className="divide-y divide-border"
            onKeyDown={(e) => handleTableKeyDown(e, filtered.length)}
          >
            {filtered.map((song, rowIdx) => (
              <>
                <tr
                  key={song.slug}
                  className={cn(
                    "hover:bg-muted/20 transition-colors",
                    selected.has(song.slug) && "bg-secondary/5"
                  )}
                >
                  <td className="px-3 py-1.5">
                    <input
                      type="checkbox"
                      checked={selected.has(song.slug)}
                      onChange={() => toggleOne(song.slug)}
                      className="rounded"
                    />
                  </td>
                  <td data-row={rowIdx} data-col={0} className="px-4 py-1.5">
                    <TextCell
                      value={song.title}
                      onSave={(v) => patchSong(song.slug, { title: v })}
                    />
                    {song.legacyId !== null && (
                      <span className="text-[10px] text-muted-foreground/60 font-mono">#{song.legacyId}</span>
                    )}
                  </td>
                  <td data-row={rowIdx} data-col={1} className="px-4 py-1.5">
                    <TextCell
                      value={song.artist ?? ""}
                      placeholder="—"
                      onSave={(v) => patchSong(song.slug, { artist: v || null })}
                    />
                  </td>
                  {tagGroups.map((group, gIdx) => (
                    <td key={group.id} data-row={rowIdx} data-col={2 + gIdx} className="px-4 py-1.5">
                      <TagGroupCell
                        selectedTags={song.tags.filter((t) => t.group.id === group.id)}
                        group={group}
                        onUpdate={(ids) => handleTagGroupUpdate(song, group.id, ids)}
                      />
                    </td>
                  ))}
                  <td className="px-2 py-1.5">
                    <button
                      type="button"
                      onClick={() => toggleExpand(song.slug)}
                      className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                      aria-label={expanded.has(song.slug) ? "Fechar letra" : "Ver letra"}
                    >
                      {expanded.has(song.slug)
                        ? <ChevronDown size={14} />
                        : <ChevronRight size={14} />
                      }
                    </button>
                  </td>
                </tr>
                {expanded.has(song.slug) && (
                  <tr key={`${song.slug}-lyrics`} className="bg-muted/10">
                    <td />
                    <td colSpan={2 + tagGroups.length + 1} className="px-4 py-3">
                      <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed max-h-48 overflow-y-auto">
                        {stripChords(song.lyrics) || "Sem letra"}
                      </pre>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={3 + tagGroups.length + 1}
                  className="px-4 py-8 text-center text-sm text-muted-foreground"
                >
                  Nenhuma música encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── TextCell ────────────────────────────────────────────────────────────────

function TextCell({
  value,
  placeholder = "",
  onSave,
}: {
  value: string;
  placeholder?: string;
  onSave: (v: string) => void;
}) {
  const [draft, setDraft] = useState(value);

  useEffect(() => setDraft(value), [value]);

  function handleBlur() {
    if (draft.trim() !== value) onSave(draft.trim());
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") e.preventDefault();
  }

  return (
    <input
      value={draft}
      placeholder={placeholder}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className="w-full bg-transparent outline-none text-sm py-0.5 border-b border-transparent focus:border-primary transition-colors placeholder:text-muted-foreground/50"
    />
  );
}

// ─── TagGroupCell ─────────────────────────────────────────────────────────────

function TagGroupCell({
  selectedTags,
  group,
  onUpdate,
}: {
  selectedTags: Tag[];
  group: TagGroup;
  onUpdate: (tagIds: number[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedIds = new Set(selectedTags.map((t) => t.id));
  const suggestions = group.tags.filter(
    (t) => !selectedIds.has(t.id) && (!query || t.name.toLowerCase().includes(query.toLowerCase()))
  );

  useEffect(() => setHighlighted(0), [suggestions.length, query]);

  function addTag(tagId: number) {
    onUpdate([...selectedIds, tagId]);
    setQuery("");
    setHighlighted(0);
    inputRef.current?.focus();
  }

  function removeTag(tagId: number) {
    onUpdate([...selectedIds].filter((id) => id !== tagId));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      e.stopPropagation();
      setHighlighted((i) => Math.min(i + 1, suggestions.length - 1));
      setOpen(true);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      e.stopPropagation();
      setHighlighted((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (open && suggestions[highlighted]) {
        e.preventDefault();
        e.stopPropagation();
        addTag(suggestions[highlighted].id);
      }
    } else if (e.key === "Escape") {
      e.stopPropagation();
      setOpen(false);
      setQuery("");
    } else if (e.key === "Backspace" && !query && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1].id);
    }
  }

  return (
    <div className="relative flex flex-wrap gap-1 items-center min-h-[28px]">
      {selectedTags.map((tag) => (
        <span
          key={tag.id}
          className="inline-flex items-center gap-0.5 h-5 px-1.5 rounded-md text-[10px] font-medium"
          style={{
            backgroundColor: `${group.color}26`,
            color: group.color,
            border: `1px solid ${group.color}4d`,
          }}
        >
          {tag.name}
          <button
            type="button"
            tabIndex={-1}
            onClick={() => removeTag(tag.id)}
            className="hover:opacity-70"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </span>
      ))}

      <input
        ref={inputRef}
        value={query}
        placeholder={selectedTags.length === 0 ? "+" : ""}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={handleKeyDown}
        className="bg-transparent outline-none text-xs py-0.5 w-12 min-w-0 placeholder:text-muted-foreground/40 border-b border-transparent focus:border-primary transition-colors"
      />

      {open && suggestions.length > 0 && (
        <div
          ref={listRef}
          className="absolute top-full left-0 mt-1 z-50 bg-background border border-border rounded-md shadow-md py-1 min-w-[140px] max-h-48 overflow-y-auto"
        >
          {suggestions.map((tag, i) => (
            <button
              key={tag.id}
              type="button"
              tabIndex={-1}
              onMouseDown={(e) => { e.preventDefault(); addTag(tag.id); }}
              className={cn(
                "w-full text-left px-3 py-1.5 text-xs transition-colors",
                i === highlighted ? "bg-muted" : "hover:bg-muted/60"
              )}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
