"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { coverFromColor } from "@/lib/cover-theme";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { GroupWithTags, TagWithCount } from "./types";

export type TagFormValues = {
  name: string;
  /** Vazio = usa a cor do grupo. */
  color: string;
  description: string;
  imageUrl: string;
};

type TagDialogProps = {
  tag: TagWithCount;
  group: GroupWithTags;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Devolve uma mensagem de erro, ou null se salvou. */
  onSave: (values: TagFormValues) => Promise<string | null>;
};

/** Editar uma categoria: nome, cor da capa, descrição e imagem (endereço). */
export default function TagDialog({ tag, group, open, onOpenChange, onSave }: TagDialogProps) {
  const [values, setValues] = useState<TagFormValues>(() => ({
    name: tag.name,
    color: tag.color ?? "",
    description: tag.description ?? "",
    imageUrl: tag.imageUrl ?? "",
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const set = <K extends keyof TagFormValues>(key: K, v: TagFormValues[K]) => setValues((prev) => ({ ...prev, [key]: v }));

  const effectiveColor = values.color || group.color;
  const { background } = coverFromColor(effectiveColor);
  const imageUrl = values.imageUrl.trim();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.name.trim()) return;
    setSaving(true);
    setError(null);
    const message = await onSave(values);
    setSaving(false);
    if (message) setError(message);
    else onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Editar categoria</DialogTitle>
            <DialogDescription>Grupo: {group.name}</DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor="tag-name">Nome</Label>
            <Input id="tag-name" value={values.name} onChange={(e) => set("name", e.target.value)} autoFocus />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tag-description">Descrição</Label>
            <Textarea
              id="tag-description"
              rows={2}
              placeholder="Aparece na capa da categoria e no card em destaque."
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tag-color">Cor da capa</Label>
            <div className="flex items-center gap-2">
              <input
                id="tag-color"
                type="color"
                value={effectiveColor}
                onChange={(e) => set("color", e.target.value)}
                className="block h-9 w-12 cursor-pointer rounded border"
              />
              <span className="text-sm text-muted-foreground">{values.color ? values.color : "a mesma do grupo"}</span>
              {values.color && (
                <Button type="button" variant="ghost" size="sm" onClick={() => set("color", "")}>
                  Usar a do grupo
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tag-image">Imagem (endereço)</Label>
            <Input
              id="tag-image"
              type="url"
              inputMode="url"
              placeholder="https://…"
              value={values.imageUrl}
              onChange={(e) => {
                setImageFailed(false);
                set("imageUrl", e.target.value);
              }}
            />
            <p className="text-xs text-muted-foreground">
              Aparece no card em destaque. Sem imagem, o card usa a cor. Por enquanto só endereço (URL), não envio de arquivo.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Prévia do topo do card</Label>
            <div className="relative aspect-[16/9] w-48 overflow-hidden rounded-md border" style={{ background }}>
              {imageUrl && !imageFailed && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="" className="absolute inset-0 size-full object-cover" onError={() => setImageFailed(true)} />
              )}
            </div>
            {imageFailed && <p className="text-xs text-warning-text">Não consegui carregar essa imagem; confira o endereço.</p>}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || !values.name.trim()}>
              {saving && <Loader2 className="size-4 animate-spin" />} Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
