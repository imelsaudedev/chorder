"use client";

import { ChordVariant, applyEnharmonicToGrid, buildChordGrid } from "@/chopro/chord-grid";
import { isValidChordName } from "@/chopro/music";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import clsx from "clsx";
import { ChevronLeft, ChevronRight, MoveHorizontal, PlusCircle, SquarePen, TrashIcon, XIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { COMMENT_CHIPS } from "../ArrangementForm/SongUnitListForm/commentChips";
import { EditableChordItem } from "@/chopro/block-model";

// Largura máxima do modal — no desktop, a largura do bloco (uma coluna
// inteira da leitura) é grande demais para um popup de grade de acordes;
// achado em teste manual ("a modal fica larga demais"). No mobile, o bloco
// já é mais estreito que isso na prática, então o `Math.min` com blockWidth
// continua valendo ali.
const CHORD_MODAL_MAX_WIDTH = 320;

export function resolveChordModalWidth(blockWidth: number | null): number {
  return blockWidth ? Math.min(blockWidth, CHORD_MODAL_MAX_WIDTH) : CHORD_MODAL_MAX_WIDTH;
}

export type ChordModalProps = {
  open: boolean;
  // "edit" = acorde já existente; "insert" = acabou de nascer deste toque —
  // rótulo e cor no topo do modal, par do anel no corpo (BlockBody).
  mode: "edit" | "insert";
  anchorRef: React.RefObject<HTMLElement | null>;
  blockWidth: number | null;
  baseKey: string;
  enharmonicPreference?: "sharp" | "flat" | null;
  item: EditableChordItem;
  activeComment: string | null;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  onApplyChord: (value: string) => void;
  onRemoveChord: () => void;
  onMoveChord: (direction: "left" | "right") => void;
  onToggleComment: (value: string) => void;
  onClose: () => void;
};

// Modal contextual do acorde (seção 8.3, D14): Radix Popover ancorado no
// botão tocado via virtualRef (não há Trigger — abrir/fechar é controlado
// pelo toque no corpo do bloco, em BlockShell), com a largura FORÇADA pra
// igualar a do bloco (style explícito lendo a largura medida — M3 da
// ANALISE.md confirmou que não há nenhum jeito "de fábrica" no Radix de
// herdar a largura de um ancestral que não seja o próprio anchor; medir e
// aplicar via style é a opção viável, não um atalho). Reaproveitado tal
// qual no mobile e no desktop — só o campo de digitar (8.3) é exclusivo de
// telas largas via `hidden sm:block`.
export default function ChordModal({
  open,
  mode,
  anchorRef,
  blockWidth,
  baseKey,
  enharmonicPreference = null,
  item,
  activeComment,
  canMoveLeft,
  canMoveRight,
  onApplyChord,
  onRemoveChord,
  onMoveChord,
  onToggleComment,
  onClose,
}: ChordModalProps) {
  const [gridExpanded, setGridExpanded] = useState(false);
  const [typedValue, setTypedValue] = useState("");
  const [typedError, setTypedError] = useState(false);

  const rawGrid = buildChordGrid(baseKey);
  const grid = applyEnharmonicToGrid(rawGrid, enharmonicPreference);

  const handleApply = useCallback(
    (value: string) => {
      onApplyChord(value);
      setTypedValue("");
      setTypedError(false);
    },
    [onApplyChord]
  );

  const handleTypedSubmit = useCallback(() => {
    const trimmed = typedValue.trim();
    if (!trimmed) return;
    if (!isValidChordName(trimmed)) {
      setTypedError(true);
      return;
    }
    handleApply(trimmed);
  }, [typedValue, handleApply]);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      {/* virtualRef exige um objeto não-nulo com getBoundingClientRect — só
          renderizamos este modal quando já há um elemento ancorado (ver
          BlockShell), então o cast é seguro. */}
      <PopoverAnchor virtualRef={anchorRef as React.RefObject<{ getBoundingClientRect(): DOMRect }>} />
      <PopoverContent
        data-testid="chord-modal"
        align="center"
        side="top"
        sideOffset={8}
        collisionPadding={{ top: 56 }}
        style={{ width: resolveChordModalWidth(blockWidth), maxWidth: "95vw" }}
        className="w-auto p-2"
        // Qualquer alvo tocável do corpo (o acorde atual ou outro, inclusive
        // em outro bloco) conta como "dentro" pra fins de fechar — é o
        // toque em cima dele, não o Radix, que decide abrir/trocar/fechar
        // (handleSelectItem em BlockShell). onInteractOutside cobre tanto
        // pointerdown quanto foco saindo do popover — clicar num <button>
        // também move o foco pra ele, então só vetar o pointerdown não
        // bastava: o Radix ainda fechava pelo lado do foco, e o toque "de
        // novo pra fechar" virava "fecha e reabre" (achado em teste).
        onInteractOutside={(event) => {
          if ((event.target as HTMLElement | null)?.closest("[data-block-item]")) {
            event.preventDefault();
          }
        }}
        onEscapeKeyDown={(event) => {
          if (gridExpanded) {
            event.preventDefault();
            setGridExpanded(false);
          }
        }}
      >
        <div className="flex flex-col gap-2">
          {/* Indicador do cenário (editar x inserir) — achado em teste manual:
              os dois toques pareciam idênticos, sem nenhum sinal de qual
              ação ia acontecer. */}
          <div
            className={clsx(
              "flex items-center gap-1.5 text-xs font-medium pb-1 border-b",
              mode === "insert" ? "text-emerald-600 border-emerald-200" : "text-sky-600 border-sky-200"
            )}
          >
            {mode === "insert" ? <PlusCircle size={13} /> : <SquarePen size={13} />}
            {mode === "insert" ? "Acorde novo" : "Editar acorde"}
          </div>

          {/* Acordes do tom + grade expandida (D7) */}
          <div className="flex items-start gap-2">
            <div className="flex-1 grid grid-cols-4 gap-1">
              {grid.flatMap((row) => [row.triad, row.seventh]).map((chord) => (
                <ChordCell
                  key={chord}
                  chord={chord}
                  isCurrent={chord === item.chords}
                  onSelect={handleApply}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setGridExpanded((v) => !v)}
              aria-label={gridExpanded ? "Recolher grade" : "Expandir grade"}
              aria-expanded={gridExpanded}
              className="p-1 text-zinc-400 hover:text-zinc-600 rounded transition-colors shrink-0"
            >
              {gridExpanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>
            {/* Campo de digitar — só desktop (8.3) */}
            <div className="hidden sm:flex flex-col gap-0.5 w-28 shrink-0">
              <Input
                value={typedValue}
                onChange={(e) => {
                  setTypedValue(e.target.value);
                  setTypedError(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleTypedSubmit();
                  }
                }}
                placeholder="Digitar..."
                className="h-7 text-xs"
              />
              {typedError && <span className="text-[10px] text-red-500">Acorde inválido</span>}
            </div>
          </div>

          {gridExpanded && (
            <div className="grid grid-cols-2 gap-1 border-t pt-2">
              {grid.map((row, i) => (
                <div key={i} className="flex gap-1">
                  <ChordCell
                    chord={row.slash}
                    variant="slash"
                    isCurrent={row.slash === item.chords}
                    onSelect={handleApply}
                  />
                  <ChordCell
                    chord={row.variante}
                    variant={row.varType ?? undefined}
                    isCurrent={row.variante === item.chords}
                    onSelect={handleApply}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Convenções (D8) */}
          <div className="flex flex-wrap gap-1 border-t pt-2">
            {COMMENT_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => onToggleComment(chip)}
                aria-pressed={activeComment === chip}
                className={clsx(
                  "text-xs px-2 py-1 rounded border transition-colors",
                  activeComment === chip
                    ? "bg-zinc-800 border-zinc-800 text-white"
                    : "border-zinc-200 hover:bg-zinc-100"
                )}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Ações do acorde */}
          <div className="flex items-center gap-1 border-t pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!canMoveLeft}
              onClick={() => onMoveChord("left")}
              aria-label="Mover acorde para a esquerda"
              className="px-2"
            >
              <MoveHorizontal size={13} className="rotate-180 mr-1" />◀
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!canMoveRight}
              onClick={() => onMoveChord("right")}
              aria-label="Mover acorde para a direita"
              className="px-2"
            >
              ▶
            </Button>
            <div className="flex-1" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemoveChord}
              className="text-red-600 hover:text-red-600 px-2"
            >
              <TrashIcon size={13} className="mr-1" />
              Remover
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Fechar modal do acorde"
              className="px-2"
            >
              <XIcon size={13} />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

type ChordCellProps = {
  chord: string | null;
  variant?: ChordVariant | "slash";
  isCurrent: boolean;
  onSelect: (chord: string) => void;
};

function ChordCell({ chord, variant, isCurrent, onSelect }: ChordCellProps) {
  if (!chord) return <div className="h-7 rounded bg-zinc-100" />;
  return (
    <button
      type="button"
      onClick={() => onSelect(chord)}
      className={clsx(
        "h-7 rounded text-center text-xs font-mono font-semibold border transition-colors",
        isCurrent
          ? "bg-zinc-800 border-zinc-800 text-white"
          : variant === "secdom"
            ? "bg-amber-50 border-amber-200 hover:bg-amber-100 text-amber-800"
            : variant === "aem"
              ? "bg-white border-dashed border-violet-200 hover:bg-violet-50 text-violet-700"
              : variant === "slash"
                ? "bg-white border-dashed border-zinc-300 hover:bg-zinc-50 text-zinc-700"
                : "bg-white border-zinc-200 shadow-xs hover:bg-zinc-50 text-zinc-800"
      )}
    >
      {chord}
    </button>
  );
}
