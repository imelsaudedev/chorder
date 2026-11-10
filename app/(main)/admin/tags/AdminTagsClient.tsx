"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, ImageIcon, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import GroupDialog, { GroupFormValues } from "./GroupDialog";
import TagDialog, { TagFormValues } from "./TagDialog";
import { GroupWithTags, PRESENTATION_LABEL, SELECTION_LABEL, TagWithCount } from "./types";

type Props = { initialGroups: GroupWithTags[] };

export default function AdminTagsClient({ initialGroups }: Props) {
  const [groups, setGroups] = useState<GroupWithTags[]>(initialGroups);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupColor, setNewGroupColor] = useState("#6b7280");
  const [newTagName, setNewTagName] = useState<Record<number, string>>({});
  const [groupDialog, setGroupDialog] = useState<GroupWithTags | null>(null);
  const [tagDialog, setTagDialog] = useState<{ tag: TagWithCount; group: GroupWithTags } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blockingError, setBlockingError] = useState<string | null>(null);

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

  /** Salva o grupo pelo diálogo; devolve a mensagem de erro, ou null se deu certo. */
  async function saveGroup(id: number, v: GroupFormValues): Promise<string | null> {
    const res = await fetch(`/api/admin/tag-groups/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: v.name.trim(),
        color: v.color,
        description: v.description,
        presentation: v.presentation,
        selection: v.selection,
        isProposed: v.isProposed,
      }),
    });
    if (!res.ok) return (await res.json().catch(() => null))?.error ?? "Não foi possível salvar o grupo.";
    await reload();
    return null;
  }

  async function moveGroup(id: number, direction: "up" | "down") {
    const idx = groups.findIndex((g) => g.id === id);
    if (idx === -1) return;
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= groups.length) return;

    const reordered = [...groups];
    [reordered[idx], reordered[newIdx]] = [reordered[newIdx], reordered[idx]];
    setGroups(reordered);

    await fetch("/api/admin/tag-groups/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: reordered.map((g) => g.id) }),
    });
  }

  async function deleteGroup(id: number) {
    if (!confirm("Apagar este grupo e todas suas tags?")) return;
    setLoading(true);
    const res = await fetch(`/api/admin/tag-groups/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const { error } = await res.json();
      setBlockingError(error);
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

  /** Salva a categoria pelo diálogo; devolve a mensagem de erro, ou null se deu certo. */
  async function saveTag(id: number, v: TagFormValues): Promise<string | null> {
    const res = await fetch(`/api/admin/tags/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: v.name.trim(),
        // vazio = volta a usar a cor do grupo
        color: v.color || null,
        description: v.description,
        imageUrl: v.imageUrl,
      }),
    });
    if (!res.ok) return (await res.json().catch(() => null))?.error ?? "Não foi possível salvar a categoria.";
    await reload();
    return null;
  }

  async function deleteTag(id: number, songCount: number) {
    if (songCount > 0) {
      setBlockingError(`Esta tag está associada a ${songCount} música${songCount > 1 ? "s" : ""} e não pode ser apagada.`);
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
      {/* Dialog de erro bloqueante (ex: tag com músicas associadas) */}
      <AlertDialog open={!!blockingError} onOpenChange={() => setBlockingError(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ação não permitida</AlertDialogTitle>
            <AlertDialogDescription>{blockingError}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setBlockingError(null)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-semibold text-sm" style={{ color: group.color }}>{group.name}</span>
              <span className="rounded-full bg-background/70 px-2 py-px text-[11px] font-medium text-muted-foreground">
                {PRESENTATION_LABEL[group.presentation]} · {SELECTION_LABEL[group.selection]}
              </span>
              {group.isProposed && (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-px text-[11px] font-semibold text-amber-700">
                  em construção
                </span>
              )}
            </div>
            <div className="flex shrink-0 gap-1">
              <Button type="button" variant="ghost" size="icon" className="w-7 h-7"
                aria-label="Subir grupo"
                disabled={groups.indexOf(group) === 0}
                onClick={() => moveGroup(group.id, "up")}>
                <ChevronUp className="w-3.5 h-3.5" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="w-7 h-7"
                aria-label="Descer grupo"
                disabled={groups.indexOf(group) === groups.length - 1}
                onClick={() => moveGroup(group.id, "down")}>
                <ChevronDown className="w-3.5 h-3.5" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="w-7 h-7"
                aria-label="Editar grupo"
                onClick={() => setGroupDialog(group)}>
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="w-7 h-7 text-destructive"
                aria-label="Apagar grupo"
                onClick={() => deleteGroup(group.id)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          <div className="p-3 space-y-1">
            {group.tags.map((tag) => (
              <div key={tag.id} className="flex items-center justify-between px-2 py-1 rounded hover:bg-muted/50">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    aria-hidden
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: tag.color ?? group.color }}
                  />
                  <span className="truncate text-sm">{tag.name}</span>
                  {tag.imageUrl && <ImageIcon aria-label="Tem imagem" className="size-3.5 shrink-0 text-muted-foreground" />}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {tag._count.songs} {tag._count.songs === 1 ? "música" : "músicas"}
                  </span>
                  <Button type="button" variant="ghost" size="icon" className="w-6 h-6"
                    aria-label={`Editar ${tag.name}`}
                    onClick={() => setTagDialog({ tag, group })}>
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="w-6 h-6 text-destructive"
                    aria-label={`Apagar ${tag.name}`}
                    onClick={() => deleteTag(tag.id, tag._count.songs)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
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
    
      {groupDialog && (
        <GroupDialog
          key={groupDialog.id}
          group={groupDialog}
          open
          onOpenChange={(o) => !o && setGroupDialog(null)}
          onSave={(v) => saveGroup(groupDialog.id, v)}
        />
      )}
      {tagDialog && (
        <TagDialog
          key={tagDialog.tag.id}
          tag={tagDialog.tag}
          group={tagDialog.group}
          open
          onOpenChange={(o) => !o && setTagDialog(null)}
          onSave={(v) => saveTag(tagDialog.tag.id, v)}
        />
      )}
    </div>
  );
}
