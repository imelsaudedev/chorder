"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

type TagWithCount = {
  id: number;
  name: string;
  tagGroupId: number;
  group?: { id: number; name: string; color: string };
  _count: { songs: number };
};

type GroupWithTags = {
  id: number;
  name: string;
  color: string;
  tags: TagWithCount[];
};

type Props = { initialGroups: GroupWithTags[] };

export default function AdminTagsClient({ initialGroups }: Props) {
  const [groups, setGroups] = useState<GroupWithTags[]>(initialGroups);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupColor, setNewGroupColor] = useState("#6b7280");
  const [newTagName, setNewTagName] = useState<Record<number, string>>({});
  const [editingGroup, setEditingGroup] = useState<number | null>(null);
  const [editingGroupName, setEditingGroupName] = useState("");
  const [editingTag, setEditingTag] = useState<number | null>(null);
  const [editingTagName, setEditingTagName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    const res = await fetch("/api/admin/tag-groups");
    const data = await res.json();
    setGroups(data);
  }

  async function createGroup() {
    if (!newGroupName.trim()) return;
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/tag-groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newGroupName.trim(), color: newGroupColor }),
    });
    if (!res.ok) {
      const { error } = await res.json();
      setError(error);
    } else {
      setNewGroupName("");
      setNewGroupColor("#6b7280");
      await reload();
    }
    setLoading(false);
  }

  async function updateGroup(id: number) {
    if (!editingGroupName.trim()) return;
    setLoading(true);
    await fetch(`/api/admin/tag-groups/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editingGroupName.trim() }),
    });
    setEditingGroup(null);
    await reload();
    setLoading(false);
  }

  async function deleteGroup(id: number) {
    if (!confirm("Apagar este grupo e todas suas tags?")) return;
    setLoading(true);
    const res = await fetch(`/api/admin/tag-groups/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const { error } = await res.json();
      setError(error);
    } else {
      await reload();
    }
    setLoading(false);
  }

  async function createTag(groupId: number) {
    const name = newTagName[groupId]?.trim();
    if (!name) return;
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, tagGroupId: groupId }),
    });
    if (!res.ok) {
      const { error } = await res.json();
      setError(error);
    } else {
      const { similar } = await res.json();
      if (similar?.length > 0) {
        setError(`Tag criada. Tags similares já existem: ${similar.map((s: TagWithCount) => s.name).join(", ")}`);
      }
      setNewTagName((prev) => ({ ...prev, [groupId]: "" }));
      await reload();
    }
    setLoading(false);
  }

  async function updateTag(id: number) {
    if (!editingTagName.trim()) return;
    setLoading(true);
    await fetch(`/api/admin/tags/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editingTagName.trim() }),
    });
    setEditingTag(null);
    await reload();
    setLoading(false);
  }

  async function deleteTag(id: number, songCount: number) {
    if (songCount > 0) {
      setError(`Esta tag está associada a ${songCount} música${songCount > 1 ? "s" : ""} e não pode ser apagada.`);
      return;
    }
    if (!confirm("Apagar esta tag?")) return;
    setLoading(true);
    await fetch(`/api/admin/tags/${id}`, { method: "DELETE" });
    await reload();
    setLoading(false);
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="flex items-start justify-between gap-2 p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)}>
            <X className="w-4 h-4 shrink-0" />
          </button>
        </div>
      )}

      {/* Novo grupo */}
      <div className="border rounded-lg p-4 space-y-3">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Novo grupo</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Nome do grupo"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createGroup()}
            className="flex-1"
          />
          <input
            type="color"
            value={newGroupColor}
            onChange={(e) => setNewGroupColor(e.target.value)}
            className="w-10 h-10 rounded border cursor-pointer"
            title="Cor do grupo"
          />
          <Button type="button" onClick={createGroup} disabled={loading || !newGroupName.trim()}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Grupos existentes */}
      {groups.map((group) => (
        <div key={group.id} className="border rounded-lg overflow-hidden">
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ backgroundColor: `${group.color}18`, borderBottom: `2px solid ${group.color}40` }}
          >
            {editingGroup === group.id ? (
              <div className="flex gap-2 flex-1">
                <Input
                  value={editingGroupName}
                  onChange={(e) => setEditingGroupName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && updateGroup(group.id)}
                  className="h-7 text-sm"
                  autoFocus
                />
                <Button type="button" size="sm" onClick={() => updateGroup(group.id)} disabled={loading}>Salvar</Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setEditingGroup(null)}>Cancelar</Button>
              </div>
            ) : (
              <>
                <span className="font-semibold text-sm" style={{ color: group.color }}>{group.name}</span>
                <div className="flex gap-1">
                  <Button type="button" variant="ghost" size="icon" className="w-7 h-7"
                    onClick={() => { setEditingGroup(group.id); setEditingGroupName(group.name); }}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="w-7 h-7 text-destructive"
                    onClick={() => deleteGroup(group.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </>
            )}
          </div>

          <div className="p-3 space-y-1">
            {group.tags.map((tag) => (
              <div key={tag.id} className="flex items-center justify-between px-2 py-1 rounded hover:bg-muted/50">
                {editingTag === tag.id ? (
                  <div className="flex gap-2 flex-1">
                    <Input
                      value={editingTagName}
                      onChange={(e) => setEditingTagName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && updateTag(tag.id)}
                      className="h-7 text-sm"
                      autoFocus
                    />
                    <Button type="button" size="sm" onClick={() => updateTag(tag.id)} disabled={loading}>Salvar</Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setEditingTag(null)}>Cancelar</Button>
                  </div>
                ) : (
                  <>
                    <span className="text-sm">{tag.name}</span>
                    <div className="flex items-center gap-2">
                      {tag._count.songs > 0 && (
                        <span className="text-xs text-muted-foreground">{tag._count.songs} músicas</span>
                      )}
                      <Button type="button" variant="ghost" size="icon" className="w-6 h-6"
                        onClick={() => { setEditingTag(tag.id); setEditingTagName(tag.name); }}>
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" className="w-6 h-6 text-destructive"
                        onClick={() => deleteTag(tag.id, tag._count.songs)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}

            <div className="flex gap-2 pt-1">
              <Input
                placeholder="Nova tag..."
                value={newTagName[group.id] ?? ""}
                onChange={(e) => setNewTagName((prev) => ({ ...prev, [group.id]: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && createTag(group.id)}
                className="h-7 text-sm"
              />
              <Button type="button" size="sm" variant="outline" onClick={() => createTag(group.id)}
                disabled={loading || !newTagName[group.id]?.trim()}>
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
