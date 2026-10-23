"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ClientServiceUnit } from "@/prisma/models";
import { Plus, Trash2 } from "lucide-react";
import { forwardRef, useId, useImperativeHandle, useRef, useState } from "react";
import { AvisosMeta, FalaMeta, LeituraMeta, SermaoMeta } from "./unitSummary";

// Formulários de edição por tipo de item (exceto Música, que tem fluxo
// próprio de busca em ServiceItemDrawer). Adicionar e editar são o mesmo
// fluxo: a unidade já existe (criada em branco por ServiceSectionBlock antes
// do formulário abrir) — por isso só existe `onUpdate`, nunca `onAdd`.
//
// Quando `isNew` é true e o usuário fecha ou troca de item sem preencher
// nada, o item recém-criado é removido sozinho via `onDiscard` — pra isso
// continuar parecendo, pro usuário, que nada aconteceu. Essa checagem é
// exposta via ref (`discardIfBlank`) pro componente pai chamar explicitamente
// nos pontos reais de "fechar"/"trocar de item" — não faz isso sozinho ao
// desmontar, porque o React (em desenvolvimento, Strict Mode) monta, desmonta
// e remonta todo componente novo uma vez para testar robustez, e isso
// apagaria o item recém-criado antes mesmo dele aparecer na tela.

export type UnitFormHandle = { discardIfBlank: () => void };

type UnitFormBaseProps = {
  unit: ClientServiceUnit;
  isNew: boolean;
  onUpdate: (changes: Partial<ClientServiceUnit>) => void;
  onDiscard: () => void;
  onDone: () => void;
};

// --- Peças compartilhadas ---

// Corpo rolável + rodapé fixo com o botão de salvar. O envio pelo <form>
// permite confirmar com Enter e usa a validação nativa dos campos.
function FormShell({
  onSubmit,
  children,
}: {
  onSubmit: () => void;
  children: React.ReactNode;
}) {
  return (
    <form
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">{children}</div>
      <div className="shrink-0 border-t border-border bg-background px-4 py-3">
        <Button type="submit" variant="secondary" className="h-11 w-full">
          Salvar
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: (id: string) => React.ReactNode;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      {children(id)}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  return (
    <Field label={label}>
      {(id) => (
        <Input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete="off"
          enterKeyHint="next"
          className="h-11"
        />
      )}
    </Field>
  );
}

function AreaField({
  label,
  value,
  onChange,
  placeholder,
  rows,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows: number;
}) {
  return (
    <Field label={label}>
      {(id) => (
        <Textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          style={{ minHeight: `${rows * 1.5 + 1}rem` }}
          className="max-h-[60dvh] resize-y"
        />
      )}
    </Field>
  );
}

function DurationField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <Field label="Duração">
      {(id) => (
        <div className="flex items-center gap-2">
          <Input
            id={id}
            type="number"
            inputMode="decimal"
            min={0}
            step={0.5}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="—"
            className="h-11 w-28"
          />
          <span className="text-sm text-muted-foreground">min</span>
        </div>
      )}
    </Field>
  );
}

function parseDuration(value: string): number | null {
  if (!value) return null;
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

// --- Fala / Oração ---

export const FalaUnitForm = forwardRef<UnitFormHandle, UnitFormBaseProps & { unitType: "FALA" | "ORACAO" }>(
  function FalaUnitForm({ unit, unitType, isNew, onUpdate, onDiscard, onDone }, ref) {
    const existingMeta = unit.metadata as FalaMeta | null;

    const [label, setLabel] = useState(unit.label ?? "");
    const [speaker, setSpeaker] = useState(existingMeta?.speaker ?? "");
    const [description, setDescription] = useState(existingMeta?.description ?? "");
    const [duration, setDuration] = useState(
      unit.durationMin != null ? String(unit.durationMin) : ""
    );
    const [saved, setSaved] = useState(false);

    useImperativeHandle(ref, () => ({
      discardIfBlank: () => {
        if (!isNew || saved) return;
        const stillBlank = !label.trim() && !speaker.trim() && !description.trim() && !duration;
        if (stillBlank) onDiscard();
      },
    }));

    function handleSave() {
      setSaved(true);
      const metadata = {
        speaker: speaker.trim() || null,
        description: description.trim() || null,
      };
      onUpdate({ label: label.trim() || null, metadata, durationMin: parseDuration(duration) });
      onDone();
    }

    return (
      <FormShell onSubmit={handleSave}>
        <TextField
          label="Título"
          value={label}
          onChange={setLabel}
          placeholder="Ex: Boas-vindas, Apresentação dos visitantes..."
          autoFocus
        />
        <TextField
          label="Quem faz"
          value={speaker}
          onChange={setSpeaker}
          placeholder="Ex: Dirigente, Pastor João..."
        />
        <AreaField
          label="Descrição"
          value={description}
          onChange={setDescription}
          placeholder={
            unitType === "ORACAO"
              ? "Motivos de oração, texto a ser lido ou observações..."
              : "Roteiro da fala, pontos que não podem faltar ou observações..."
          }
          rows={9}
        />
        <DurationField value={duration} onChange={setDuration} />
      </FormShell>
    );
  }
);

// --- Leitura ---

export const LeituraUnitForm = forwardRef<UnitFormHandle, UnitFormBaseProps>(
  function LeituraUnitForm({ unit, isNew, onUpdate, onDiscard, onDone }, ref) {
    const existingMeta = unit.metadata as LeituraMeta | null;

    const [label, setLabel] = useState(unit.label ?? "");
    const [version, setVersion] = useState(existingMeta?.version ?? "");
    const [text, setText] = useState(existingMeta?.text ?? "");
    const [duration, setDuration] = useState(
      unit.durationMin != null ? String(unit.durationMin) : ""
    );
    const [saved, setSaved] = useState(false);

    useImperativeHandle(ref, () => ({
      discardIfBlank: () => {
        if (!isNew || saved) return;
        const stillBlank = !label.trim() && !version.trim() && !text.trim() && !duration;
        if (stillBlank) onDiscard();
      },
    }));

    function handleSave() {
      setSaved(true);
      const metadata = {
        version: version.trim() || null,
        text: text.trim() || null,
      };
      onUpdate({ label: label.trim() || null, metadata, durationMin: parseDuration(duration) });
      onDone();
    }

    return (
      <FormShell onSubmit={handleSave}>
        <TextField
          label="Referência"
          value={label}
          onChange={setLabel}
          placeholder="Ex: João 3:16, Salmo 23..."
          autoFocus
        />
        <TextField
          label="Versão"
          value={version}
          onChange={setVersion}
          placeholder="Ex: NVI, ARA, NTLH..."
        />
        <AreaField
          label="Texto"
          value={text}
          onChange={setText}
          placeholder="Cole o texto da passagem aqui..."
          rows={9}
        />
        <DurationField value={duration} onChange={setDuration} />
      </FormShell>
    );
  }
);

// --- Sermão ---

export const SermaoUnitForm = forwardRef<UnitFormHandle, UnitFormBaseProps>(
  function SermaoUnitForm({ unit, isNew, onUpdate, onDiscard, onDone }, ref) {
    const existingMeta = unit.metadata as SermaoMeta | null;

    const [label, setLabel] = useState(unit.label ?? "");
    const [preacher, setPreacher] = useState(existingMeta?.preacher ?? "");
    const [reference, setReference] = useState(existingMeta?.reference ?? "");
    const [description, setDescription] = useState(existingMeta?.description ?? "");
    const [duration, setDuration] = useState(
      unit.durationMin != null ? String(unit.durationMin) : ""
    );
    const [saved, setSaved] = useState(false);

    useImperativeHandle(ref, () => ({
      discardIfBlank: () => {
        if (!isNew || saved) return;
        const stillBlank =
          !label.trim() && !preacher.trim() && !reference.trim() && !description.trim() && !duration;
        if (stillBlank) onDiscard();
      },
    }));

    function handleSave() {
      setSaved(true);
      const metadata = {
        preacher: preacher.trim() || null,
        reference: reference.trim() || null,
        description: description.trim() || null,
      };
      onUpdate({ label: label.trim() || null, metadata, durationMin: parseDuration(duration) });
      onDone();
    }

    return (
      <FormShell onSubmit={handleSave}>
        <TextField
          label="Tema"
          value={label}
          onChange={setLabel}
          placeholder="Ex: A graça que transforma..."
          autoFocus
        />
        <TextField
          label="Pregador"
          value={preacher}
          onChange={setPreacher}
          placeholder="Ex: Pastor João..."
        />
        <TextField
          label="Referência bíblica"
          value={reference}
          onChange={setReference}
          placeholder="Ex: João 3:16, Rm 8:28..."
        />
        <AreaField
          label="Notas"
          value={description}
          onChange={setDescription}
          placeholder="Pontos principais do sermão, ilustrações ou observações..."
          rows={9}
        />
        <DurationField value={duration} onChange={setDuration} />
      </FormShell>
    );
  }
);

// --- Avisos ---

type AvisosItem = { id: string; text: string };

export const AvisosUnitForm = forwardRef<UnitFormHandle, UnitFormBaseProps>(
  function AvisosUnitForm({ unit, isNew, onUpdate, onDiscard, onDone }, ref) {
    const existingMeta = unit.metadata as AvisosMeta | null;
    const existingItems = existingMeta?.items ?? [];

    const [items, setItems] = useState<AvisosItem[]>(
      existingItems.length ? existingItems : [{ id: crypto.randomUUID(), text: "" }]
    );
    const [duration, setDuration] = useState(
      unit.durationMin != null ? String(unit.durationMin) : ""
    );
    const [saved, setSaved] = useState(false);
    const listRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      discardIfBlank: () => {
        if (!isNew || saved) return;
        const stillBlank = items.every((item) => !item.text.trim()) && !duration;
        if (stillBlank) onDiscard();
      },
    }));

    function updateItemText(id: string, text: string) {
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, text } : item)));
    }

    function removeItem(id: string) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }

    function addItem() {
      setItems((prev) => [...prev, { id: crypto.randomUUID(), text: "" }]);
      // Foca o campo recém-criado depois que ele entra na tela.
      requestAnimationFrame(() => {
        const inputs = listRef.current?.querySelectorAll<HTMLInputElement>("input");
        inputs?.[inputs.length - 1]?.focus();
      });
    }

    function handleSave() {
      setSaved(true);
      const cleanItems = items
        .map((item) => ({ ...item, text: item.text.trim() }))
        .filter((item) => item.text);
      onUpdate({ label: null, metadata: { items: cleanItems }, durationMin: parseDuration(duration) });
      onDone();
    }

    return (
      <FormShell onSubmit={handleSave}>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">Avisos</span>
          <div ref={listRef} className="flex flex-col gap-2">
            {items.map((item, i) => (
              <div key={item.id} className="flex items-center gap-1">
                <Input
                  type="text"
                  value={item.text}
                  onChange={(e) => updateItemText(item.id, e.target.value)}
                  placeholder={`Aviso ${i + 1}`}
                  aria-label={`Aviso ${i + 1}`}
                  autoFocus={i === 0}
                  autoComplete="off"
                  className="h-11 flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="cursor-pointer flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-destructive focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  aria-label={`Remover aviso ${i + 1}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <Button type="button" variant="ghost" onClick={addItem} className="h-11 self-start gap-1 px-2">
            <Plus className="w-4 h-4" />
            Adicionar aviso
          </Button>
        </div>
        <DurationField value={duration} onChange={setDuration} />
      </FormShell>
    );
  }
);
