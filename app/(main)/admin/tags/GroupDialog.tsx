"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import {
  GroupWithTags,
  PRESENTATION_HELP,
  PRESENTATION_LABEL,
  Presentation,
  SELECTION_LABEL,
  Selection,
} from "./types";

export type GroupFormValues = {
  name: string;
  color: string;
  description: string;
  presentation: Presentation;
  selection: Selection;
  isProposed: boolean;
};

type GroupDialogProps = {
  group: GroupWithTags;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Devolve uma mensagem de erro, ou null se salvou. */
  onSave: (values: GroupFormValues) => Promise<string | null>;
};

function Choice<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: Record<T, string>;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex gap-1 rounded-md bg-muted/40 p-1">
      {(Object.keys(options) as T[]).map((key) => (
        <button
          key={key}
          type="button"
          role="radio"
          aria-checked={value === key}
          onClick={() => onChange(key)}
          className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
            value === key ? "bg-background shadow-xs" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {options[key]}
        </button>
      ))}
    </div>
  );
}

/** Editar um grupo de categorias: nome, cor, a pergunta que responde, apresentação na home etc. */
export default function GroupDialog({ group, open, onOpenChange, onSave }: GroupDialogProps) {
  const [values, setValues] = useState<GroupFormValues>(() => ({
    name: group.name,
    color: group.color,
    description: group.description ?? "",
    presentation: group.presentation,
    selection: group.selection,
    isProposed: group.isProposed,
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof GroupFormValues>(key: K, v: GroupFormValues[K]) => setValues((prev) => ({ ...prev, [key]: v }));

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
            <DialogTitle>Editar grupo</DialogTitle>
            <DialogDescription>Como o grupo aparece na tela de Músicas.</DialogDescription>
          </DialogHeader>

          <div className="flex gap-2">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="group-name">Nome</Label>
              <Input id="group-name" value={values.name} onChange={(e) => set("name", e.target.value)} autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="group-color">Cor</Label>
              <input
                id="group-color"
                type="color"
                value={values.color}
                onChange={(e) => set("color", e.target.value)}
                className="block h-9 w-12 cursor-pointer rounded border"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="group-description">Pergunta que o grupo responde</Label>
            <Textarea
              id="group-description"
              rows={2}
              placeholder="Ex.: Para qual data ou ritual a música serve?"
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Na home de Músicas</Label>
            <div>
              <Choice label="Apresentação" value={values.presentation} options={PRESENTATION_LABEL} onChange={(v) => set("presentation", v)} />
            </div>
            <p className="text-xs text-muted-foreground">{PRESENTATION_HELP[values.presentation]}</p>
          </div>

          <div className="space-y-1.5">
            <Label>Quantos valores uma música pode ter</Label>
            <div>
              <Choice label="Seleção" value={values.selection} options={SELECTION_LABEL} onChange={(v) => set("selection", v)} />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-md border p-3">
            <div>
              <Label htmlFor="group-proposed">Em construção</Label>
              <p className="text-xs text-muted-foreground">Grupo ainda em validação com o ministério: a home mostra o selo.</p>
            </div>
            <Switch id="group-proposed" checked={values.isProposed} onCheckedChange={(v) => set("isProposed", v)} />
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
