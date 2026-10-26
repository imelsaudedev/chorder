"use client";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ClientServiceUnit } from "@/prisma/models";
import {
  attachClosestEdge,
  Edge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { DropIndicator } from "@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { GripVertical, Minus, Plus, Trash2 } from "lucide-react";
import { forwardRef, useCallback, useEffect, useId, useImperativeHandle, useRef, useState } from "react";
import { usePlanMode } from "./planMode";
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

// Duração como stepper (− 5 min +): números redondos são o caso comum, então os
// botões são mais rápidos que digitar; o campo no meio ainda aceita digitar
// (inclusive meio minuto). Compacto o bastante para dividir a linha com outro campo.
export function DurationField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const current = value === "" ? 0 : parseFloat(value) || 0;
  const change = (delta: number) =>
    onChange(String(Math.max(0, Math.round((current + delta) * 10) / 10)));

  return (
    <Field label="Duração">
      {(id) => (
        <ButtonGroup>
          <Button
            type="button"
            variant="outline"
            className="size-11 cursor-pointer"
            aria-label="Diminuir a duração em 1 minuto"
            disabled={current <= 0}
            onClick={() => change(-1)}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <div className="relative">
            <Input
              id={id}
              type="number"
              inputMode="decimal"
              min={0}
              step={0.5}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="—"
              className="h-11 w-20 rounded-none pr-9 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground"
            >
              min
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            className="size-11 cursor-pointer"
            aria-label="Aumentar a duração em 1 minuto"
            onClick={() => change(1)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </ButtonGroup>
      )}
    </Field>
  );
}

// Linha com um campo de texto e, ao lado, a duração.
function FieldWithDuration({
  children,
  duration,
  onDurationChange,
}: {
  children: React.ReactNode;
  duration: string;
  onDurationChange: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
      {children}
      <DurationField value={duration} onChange={onDurationChange} />
    </div>
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
    const mode = usePlanMode();

    useImperativeHandle(ref, () => ({
      discardIfBlank: () => {
        // No modelo, um item em branco é um estado válido (o esqueleto da
        // liturgia) — só descarta sozinho no culto de verdade.
        if (!isNew || saved || mode === "template") return;
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
        <FieldWithDuration duration={duration} onDurationChange={setDuration}>
          <TextField
          label="Quem faz"
          value={speaker}
          onChange={setSpeaker}
          placeholder="Ex: Dirigente, Pastor João..."
        />
        </FieldWithDuration>
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
    const mode = usePlanMode();

    useImperativeHandle(ref, () => ({
      discardIfBlank: () => {
        // No modelo, um item em branco é um estado válido (o esqueleto da
        // liturgia) — só descarta sozinho no culto de verdade.
        if (!isNew || saved || mode === "template") return;
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
        <FieldWithDuration duration={duration} onDurationChange={setDuration}>
          <TextField
          label="Versão"
          value={version}
          onChange={setVersion}
          placeholder="Ex: NVI, ARA, NTLH..."
        />
        </FieldWithDuration>
        <AreaField
          label="Texto"
          value={text}
          onChange={setText}
          placeholder="Cole o texto da passagem aqui..."
          rows={9}
        />
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
    const mode = usePlanMode();

    useImperativeHandle(ref, () => ({
      discardIfBlank: () => {
        // No modelo, um item em branco é um estado válido (o esqueleto da
        // liturgia) — só descarta sozinho no culto de verdade.
        if (!isNew || saved || mode === "template") return;
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
        <FieldWithDuration duration={duration} onDurationChange={setDuration}>
          <TextField
          label="Pregador"
          value={preacher}
          onChange={setPreacher}
          placeholder="Ex: Pastor João..."
        />
        </FieldWithDuration>
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
    const mode = usePlanMode();
    const listRef = useRef<HTMLDivElement>(null);
    const formId = useId();
    // Mensagem para leitores de tela ao reordenar pelo teclado.
    const [announcement, setAnnouncement] = useState("");

    useImperativeHandle(ref, () => ({
      discardIfBlank: () => {
        // No modelo, um item em branco é um estado válido (o esqueleto da
        // liturgia) — só descarta sozinho no culto de verdade.
        if (!isNew || saved || mode === "template") return;
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

    const moveItem = useCallback((from: number, to: number) => {
      setItems((prev) => {
        const next = [...prev];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        return next;
      });
    }, []);

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
        <DurationField value={duration} onChange={setDuration} />
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">Avisos</span>
          <div role="status" aria-live="polite" className="sr-only">
            {announcement}
          </div>
          <div ref={listRef} className="flex flex-col gap-2">
            {items.map((item, i) => (
              <SortableAvisoRow
                key={item.id}
                item={item}
                index={i}
                count={items.length}
                formId={formId}
                onChange={(text) => updateItemText(item.id, text)}
                onRemove={() => removeItem(item.id)}
                onMove={moveItem}
                onAnnounce={setAnnouncement}
              />
            ))}
          </div>
          <Button type="button" variant="ghost" onClick={addItem} className="h-11 self-start gap-1 px-2">
            <Plus className="w-4 h-4" />
            Adicionar aviso
          </Button>
        </div>
      </FormShell>
    );
  }
);

// --- Aviso reordenável ---

type AvisoDragData = { type: "aviso"; formId: string; index: number };

function isAvisoDragData(data: Record<string, unknown>, formId: string): data is AvisoDragData {
  return data.type === "aviso" && data.formId === formId;
}

// Linha de um aviso: alça de reordenar (arrastar ou setas do teclado, como nos itens
// da liturgia), campo de texto e remover.
function SortableAvisoRow({
  item,
  index,
  count,
  formId,
  onChange,
  onRemove,
  onMove,
  onAnnounce,
}: {
  item: { id: string; text: string };
  index: number;
  count: number;
  formId: string;
  onChange: (text: string) => void;
  onRemove: () => void;
  onMove: (from: number, to: number) => void;
  onAnnounce: (message: string) => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);

  useEffect(() => {
    const el = rowRef.current;
    const handle = handleRef.current;
    if (!el || !handle) return;
    return draggable({
      element: el,
      dragHandle: handle,
      getInitialData: () => ({ type: "aviso", formId, index }) satisfies AvisoDragData,
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });
  }, [formId, index]);

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    return dropTargetForElements({
      element: el,
      canDrop: ({ source }) => isAvisoDragData(source.data as Record<string, unknown>, formId),
      getData: ({ input, element }) =>
        attachClosestEdge(
          { type: "aviso", formId, index } satisfies AvisoDragData,
          { input, element, allowedEdges: ["top", "bottom"] }
        ),
      onDrag: ({ self }) => setClosestEdge(extractClosestEdge(self.data)),
      onDragLeave: () => setClosestEdge(null),
      onDrop: ({ self, source }) => {
        setClosestEdge(null);
        const drag = source.data as AvisoDragData;
        if (!isAvisoDragData(drag, formId)) return;
        const edge = extractClosestEdge(self.data);
        const destIndex = edge === "bottom" ? index + 1 : index;
        const adjustedDest = drag.index < index ? destIndex - 1 : destIndex;
        if (drag.index === adjustedDest) return;
        onMove(drag.index, adjustedDest);
      },
    });
  }, [formId, index, onMove]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    e.preventDefault();
    const to = e.key === "ArrowUp" ? index - 1 : index + 1;
    if (to < 0 || to >= count) return;
    onMove(index, to);
    onAnnounce(`Aviso ${to + 1} de ${count}.`);
    // A linha pode ser remontada ao reordenar; devolve o foco para a alça.
    requestAnimationFrame(() => {
      document.querySelector<HTMLElement>(`[data-aviso-handle="${item.id}"]`)?.focus();
    });
  }

  return (
    <div ref={rowRef} className={`relative flex items-center ${isDragging ? "opacity-40" : ""}`}>
      <div
        ref={handleRef}
        role="button"
        tabIndex={0}
        data-aviso-handle={item.id}
        aria-label={`Reordenar o aviso ${index + 1}. Use as setas para cima e para baixo para mover.`}
        onKeyDown={handleKeyDown}
        className="grid h-11 w-8 shrink-0 cursor-grab place-items-center rounded-md text-muted-foreground touch-none active:cursor-grabbing focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <GripVertical className="w-5 h-5" />
      </div>
      <Input
        type="text"
        value={item.text}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Aviso ${index + 1}`}
        aria-label={`Aviso ${index + 1}`}
        autoFocus={index === 0}
        autoComplete="off"
        className="h-11 flex-1"
      />
      <button
        type="button"
        onClick={onRemove}
        className="cursor-pointer flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-destructive focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        aria-label={`Remover aviso ${index + 1}`}
      >
        <Trash2 className="w-4 h-4" />
      </button>
      {closestEdge && <DropIndicator edge={closestEdge} gap="0px" />}
    </div>
  );
}

// --- Música (espaço no template) ---

// No template Música não escolhe uma música: é um espaço com título opcional
// ("Música de abertura") e duração, que o culto preenche depois.
export const SongSlotForm = forwardRef<UnitFormHandle, UnitFormBaseProps>(
  function SongSlotForm({ unit, isNew, onUpdate, onDiscard, onDone }, ref) {
    const initialDuration = unit.durationMin != null ? String(unit.durationMin) : "";
    const [label, setLabel] = useState(unit.label ?? "");
    const [duration, setDuration] = useState(initialDuration);
    const [saved, setSaved] = useState(false);
    const mode = usePlanMode();

    useImperativeHandle(ref, () => ({
      discardIfBlank: () => {
        // Este formulário só existe no modelo — um espaço de música em
        // branco é o próprio propósito dele, nunca descarta sozinho.
        if (!isNew || saved || mode === "template") return;
        if (!label.trim() && duration === initialDuration) onDiscard();
      },
    }));

    function handleSave() {
      setSaved(true);
      onUpdate({ label: label.trim() || null, durationMin: parseDuration(duration) });
      onDone();
    }

    return (
      <FormShell onSubmit={handleSave}>
        <FieldWithDuration duration={duration} onDurationChange={setDuration}>
          <TextField
            label="Título (opcional)"
            value={label}
            onChange={setLabel}
            placeholder="Ex: Música de abertura"
            autoFocus
          />
        </FieldWithDuration>
        <p className="text-sm text-muted-foreground">
          No modelo a música é só um espaço. Quem montar o culto escolhe a música e o arranjo.
        </p>
      </FormShell>
    );
  }
);
