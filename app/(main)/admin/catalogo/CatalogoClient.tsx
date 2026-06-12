"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Tag = { id: number; name: string; group: { id: number; name: string; color: string } };
type TagGroup = { id: number; name: string; color: string; tags: { id: number; name: string }[] };
type CatalogSong = { slug: string; title: string; artist: string | null; tags: Tag[] };
type Props = { songs: CatalogSong[]; tagGroups: TagGroup[] };

// Total de colunas = 2 (título, compositor) + tagGroups.length
function colCount(tagGroups: TagGroup[]) {
  return 2 + tagGroups.length;
}

function focusCell(row: number, col: number) {
  const input = document.querySelector<HTMLElement>(
    `td[data-row="${row}"][data-col="${col}"] input`
  );
  input?.focus();
}

export default function CatalogoClient({ songs: initialSongs, tagGroups }: Props) {
  const [songs, setSongs] = useState<CatalogSong[]>(initialSongs);
  const [search, setSearch] = useState("");

  const filtered = search
    ? songs.filter(
        (s) =>
          s.title.toLowerCase().includes(search.toLowerCase()) ||
          s.artist?.toLowerCase().includes(search.toLowerCase())
      )
    : songs;

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
          // Reconstruir tags a partir dos ids
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

  // Navegação tipo planilha — capturada na tabela para não interferir com cells
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
      // Enter só desce linha se não há sugestão sendo selecionada (stopPropagation nos cells)
      e.preventDefault();
      if (row + 1 < totalRows) focusCell(row + 1, col);
    }
  }

  return (
    <div className="pb-16">
      <div className="mb-4 max-w-sm">
        <Input
          placeholder="Filtrar por título ou compositor…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 text-sm"
        />
      </div>

      <div className="rounded-lg border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-xs text-muted-foreground uppercase tracking-wide">
              <th className="px-4 py-2.5 text-left font-medium w-[25%]">Título</th>
              <th className="px-4 py-2.5 text-left font-medium w-[18%]">Compositor</th>
              {tagGroups.map((g) => (
                <th key={g.id} className="px-4 py-2.5 text-left font-medium whitespace-nowrap">
                  <span style={{ color: g.color }}>{g.name}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody
            className="divide-y divide-border"
            onKeyDown={(e) => handleTableKeyDown(e, filtered.length)}
          >
            {filtered.map((song, rowIdx) => (
              <tr key={song.slug} className="hover:bg-muted/20 transition-colors">
                <td data-row={rowIdx} data-col={0} className="px-4 py-1.5">
                  <TextCell
                    value={song.title}
                    onSave={(v) => patchSong(song.slug, { title: v })}
                  />
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
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={2 + tagGroups.length}
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

  // Sincronizar quando o valor externo muda (atualização otimista)
  useEffect(() => setDraft(value), [value]);

  function handleBlur() {
    if (draft.trim() !== value) onSave(draft.trim());
  }

  // Enter e Tab são capturados na tabela — aqui só impedimos o submit default
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") e.preventDefault(); // deixa subir para o handler da tabela
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
        e.stopPropagation(); // não deixa subir para o handler de linha
        addTag(suggestions[highlighted].id);
      }
      // se não há sugestão visível, Enter sobe para o handler da tabela
    } else if (e.key === "Escape") {
      e.stopPropagation();
      setOpen(false);
      setQuery("");
    } else if (e.key === "Backspace" && !query && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1].id);
    }
    // Tab sobe para o handler da tabela (muda de coluna)
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
