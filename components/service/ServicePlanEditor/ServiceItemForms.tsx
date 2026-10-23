"use client";

import { ClientServiceUnit } from "@/prisma/models";
import { Plus, Trash2 } from "lucide-react";
import { forwardRef, useImperativeHandle, useState } from "react";

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

// --- Fala / Oração ---

type FalaMeta = { speaker?: string | null; description?: string | null };

export const FalaUnitForm = forwardRef<UnitFormHandle, UnitFormBaseProps & { unitType: "FALA" | "ORACAO" }>(
  function FalaUnitForm({ unit, isNew, onUpdate, onDiscard, onDone }, ref) {
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
      const durationMin = duration ? parseFloat(duration) : null;
      const metadata = {
        speaker: speaker.trim() || null,
        description: description.trim() || null,
      };
      onUpdate({ label: label.trim() || null, metadata, durationMin });
      onDone();
    }

    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-500">Título</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Ex: Boas-vindas, Apresentação dos visitantes..."
            autoFocus
            className="border border-zinc-300 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-500">Quem faz</label>
          <input
            type="text"
            value={speaker}
            onChange={(e) => setSpeaker(e.target.value)}
            placeholder="Ex: Dirigente, Pastor João..."
            className="border border-zinc-300 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-500">Descrição</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Roteiro, orientações ou observações para este momento..."
            rows={4}
            className="border border-zinc-300 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400 resize-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-500">Duração (min)</label>
          <input
            type="number"
            min={0}
            step={0.5}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="—"
            className="border border-zinc-300 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400 w-24"
          />
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="py-2.5 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          Salvar
        </button>
      </div>
    );
  }
);

// --- Leitura ---

type LeituraMeta = { version?: string | null; text?: string | null };

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
      const durationMin = duration ? parseFloat(duration) : null;
      const metadata = {
        version: version.trim() || null,
        text: text.trim() || null,
      };
      onUpdate({ label: label.trim() || null, metadata, durationMin });
      onDone();
    }

    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-500">Referência</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Ex: João 3:16, Salmo 23..."
            autoFocus
            className="border border-zinc-300 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-500">Versão</label>
          <input
            type="text"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="Ex: NVI, ARA, NTLH..."
            className="border border-zinc-300 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-500">Texto</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Cole o texto da passagem aqui..."
            rows={6}
            className="border border-zinc-300 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400 resize-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-500">Duração (min)</label>
          <input
            type="number"
            min={0}
            step={0.5}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="—"
            className="border border-zinc-300 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400 w-24"
          />
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="py-2.5 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          Salvar
        </button>
      </div>
    );
  }
);

// --- Sermão ---

type SermaoMeta = { preacher?: string | null; reference?: string | null; description?: string | null };

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
      const durationMin = duration ? parseFloat(duration) : null;
      const metadata = {
        preacher: preacher.trim() || null,
        reference: reference.trim() || null,
        description: description.trim() || null,
      };
      onUpdate({ label: label.trim() || null, metadata, durationMin });
      onDone();
    }

    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-500">Tema</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Ex: A graça que transforma..."
            autoFocus
            className="border border-zinc-300 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-500">Pregador</label>
          <input
            type="text"
            value={preacher}
            onChange={(e) => setPreacher(e.target.value)}
            placeholder="Ex: Pastor João..."
            className="border border-zinc-300 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-500">Referência bíblica</label>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Ex: João 3:16, Rm 8:28..."
            className="border border-zinc-300 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-500">Notas</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Observações ou roteiro..."
            rows={4}
            className="border border-zinc-300 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400 resize-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-500">Duração (min)</label>
          <input
            type="number"
            min={0}
            step={0.5}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="—"
            className="border border-zinc-300 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400 w-24"
          />
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="py-2.5 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          Salvar
        </button>
      </div>
    );
  }
);

// --- Avisos ---

type AvisosItem = { id: string; text: string };
type AvisosMeta = { items?: AvisosItem[] };

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
    }

    function handleSave() {
      setSaved(true);
      const durationMin = duration ? parseFloat(duration) : null;
      const cleanItems = items
        .map((item) => ({ ...item, text: item.text.trim() }))
        .filter((item) => item.text);
      onUpdate({ label: null, metadata: { items: cleanItems }, durationMin });
      onDone();
    }

    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-500">Avisos</label>
          <div className="flex flex-col gap-2">
            {items.map((item, i) => (
              <div key={item.id} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) => updateItemText(item.id, e.target.value)}
                  placeholder={`Aviso ${i + 1}`}
                  autoFocus={i === 0}
                  className="flex-1 border border-zinc-300 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400"
                />
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="shrink-0 text-zinc-300 hover:text-red-400 transition-colors"
                  aria-label="Remover aviso"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addItem}
            className="self-start flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Adicionar aviso
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-500">Duração (min)</label>
          <input
            type="number"
            min={0}
            step={0.5}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="—"
            className="border border-zinc-300 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400 w-24"
          />
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="py-2.5 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          Salvar
        </button>
      </div>
    );
  }
);
