"use client";

import { ChordVariant, applyEnharmonicToGrid, buildChordGrid } from "@/chopro/chord-grid";
import { isValidChordName } from "@/chopro/music";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import clsx from "clsx";
import {
  ChevronLeft,
  ChevronRight,
  MessageSquareIcon,
  MoveHorizontal,
  PlusCircle,
  SquarePen,
  TrashIcon,
  XIcon,
} from "lucide-react";
import { useCallback, useState } from "react";
import { COMMENT_CHIPS } from "../ArrangementForm/SongUnitListForm/commentChips";
import { MoveDirection } from "@/chopro/block-model";

// Largura máxima do modal — no desktop, a largura do bloco (uma coluna
// inteira da leitura) é grande demais para um popup de grade de acordes;
// achado em teste manual ("a modal fica larga demais"). No mobile, o bloco
// já é mais estreito que isso na prática, então o `Math.min` com blockWidth
// continua valendo ali.
const CHORD_MODAL_MAX_WIDTH = 320;

export function resolveChordModalWidth(blockWidth: number | null): number {
  return blockWidth ? Math.min(blockWidth, CHORD_MODAL_MAX_WIDTH) : CHORD_MODAL_MAX_WIDTH;
}

// O que o modal está editando — resolvido pelo BlockShell a partir do
// ordinal rastreado (ver chopro/block-model.ts, ordinalOfToken). "empty" é o
// toque numa letra/espaço sem nada ali ainda (Round 2: nada é inserido só
// de tocar — só a ESCOLHA dentro do modal, grade/convenção, é que muda o
// conteúdo). "chord"/"comment" são alvos que já existem de verdade.
export type ChordModalTarget =
  | {
      kind: "chord";
      value: string;
      activeComment: string | null;
      canMoveLeft: boolean;
      canMoveRight: boolean;
    }
  | { kind: "comment"; value: string }
  | { kind: "empty" };

export type ChordModalProps = {
  open: boolean;
  target: ChordModalTarget;
  anchorRef: React.RefObject<HTMLElement | null>;
  blockWidth: number | null;
  baseKey: string;
  enharmonicPreference?: "sharp" | "flat" | null;
  onApplyChord: (value: string) => void;
  onApplyComment: (value: string) => void;
  onRemove: () => void;
  onMoveChord: (direction: MoveDirection) => void;
  // D8: convenção EMPARELHADA com o acorde sendo editado (target.kind ===
  // "chord") — toggle de aplicar/trocar/remover num só toque. Diferente do
  // toggle Acorde/Convenção da aba (que nasce de tocar numa letra vazia).
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
  target,
  anchorRef,
  blockWidth,
  baseKey,
  enharmonicPreference = null,
  onApplyChord,
  onApplyComment,
  onRemove,
  onMoveChord,
  onToggleComment,
  onClose,
}: ChordModalProps) {
  const [gridExpanded, setGridExpanded] = useState(false);
  const [typedValue, setTypedValue] = useState("");
  const [typedError, setTypedError] = useState(false);
  // Toggle Acorde/Convenção (Round 2: "nasce de tocar na letra") — só existe
  // de fato quando target.kind é "empty" (nada ainda); pra um acorde ou
  // convenção já existente não há escolha, a view é fixa no tipo dele. O
  // BlockShell troca o `key` do componente sempre que o alvo muda de
  // identidade, então este estado nunca "vaza" de um toque pro próximo.
  const [activeTab, setActiveTab] = useState<"chord" | "comment">("chord");
  const view = target.kind === "empty" ? activeTab : target.kind;

  const rawGrid = buildChordGrid(baseKey);
  const grid = applyEnharmonicToGrid(rawGrid, enharmonicPreference);
  const currentChordValue = target.kind === "chord" ? target.value : null;
  const currentCommentValue = target.kind === "comment" ? target.value : null;

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

  // Convenção tocada na aba/alvo "comment": tocar na mesma que já está
  // aplicada remove (mesmo toggle do D8, só que operando direto no token de
  // convenção em vez de no acorde emparelhado); tocar numa diferente troca;
  // e no alvo "empty" não há "já aplicada" — toda escolha insere uma nova.
  const handlePickComment = useCallback(
    (value: string) => {
      if (currentCommentValue === value) {
        onRemove();
        return;
      }
      onApplyComment(value);
    },
    [currentCommentValue, onApplyComment, onRemove]
  );

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
          {/* Toggle Acorde/Convenção — só no alvo "empty" (Round 2: nasce de
              tocar numa letra sem nada ainda; pra algo que já existe a view
              já é a do tipo dele, sem escolha). */}
          {target.kind === "empty" ? (
            <div className="flex items-center gap-1 pb-1 border-b border-emerald-200">
              <button
                type="button"
                onClick={() => setActiveTab("chord")}
                aria-pressed={view === "chord"}
                className={clsx(
                  "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded transition-colors",
                  view === "chord" ? "bg-emerald-600 text-white" : "text-emerald-700 hover:bg-emerald-50"
                )}
              >
                <PlusCircle size={13} />
                Acorde
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("comment")}
                aria-pressed={view === "comment"}
                className={clsx(
                  "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded transition-colors",
                  view === "comment" ? "bg-emerald-600 text-white" : "text-emerald-700 hover:bg-emerald-50"
                )}
              >
                <MessageSquareIcon size={13} />
                Convenção
              </button>
            </div>
          ) : (
            // Indicador do cenário (editar x inserir) — achado em teste
            // manual: os dois toques pareciam idênticos, sem nenhum sinal de
            // qual ação ia acontecer.
            <div className="flex items-center gap-1.5 text-xs font-medium pb-1 border-b text-sky-600 border-sky-200">
              <SquarePen size={13} />
              {target.kind === "comment" ? "Editar convenção" : "Editar acorde"}
            </div>
          )}

          {view === "chord" ? (
            <>
              {/* Acordes do tom + grade expandida (D7) */}
              <div className="flex items-start gap-2">
                <div className="flex-1 grid grid-cols-4 gap-1">
                  {grid.flatMap((row) => [row.triad, row.seventh]).map((chord) => (
                    <ChordCell
                      key={chord}
                      chord={chord}
                      isCurrent={chord === currentChordValue}
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
                        isCurrent={row.slash === currentChordValue}
                        onSelect={handleApply}
                      />
                      <ChordCell
                        chord={row.variante}
                        variant={row.varType ?? undefined}
                        isCurrent={row.variante === currentChordValue}
                        onSelect={handleApply}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Convenção EMPARELHADA com este acorde (D8) — só faz
                  sentido pra um acorde que já existe de verdade. */}
              {target.kind === "chord" && (
                <div className="flex flex-wrap gap-1 border-t pt-2">
                  {COMMENT_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => onToggleComment(chip)}
                      aria-pressed={target.activeComment === chip}
                      className={clsx(
                        "text-xs px-2 py-1 rounded border transition-colors",
                        target.activeComment === chip
                          ? "bg-zinc-800 border-zinc-800 text-white"
                          : "border-zinc-200 hover:bg-zinc-100"
                      )}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            // Convenção isolada (não emparelhada a um acorde) — aba
            // "Convenção" do toggle (alvo "empty") ou edição direta de uma
            // convenção já existente (alvo "comment").
            <div className="flex flex-wrap gap-1">
              {COMMENT_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handlePickComment(chip)}
                  aria-pressed={currentCommentValue === chip}
                  className={clsx(
                    "text-xs px-2 py-1 rounded border transition-colors",
                    currentCommentValue === chip
                      ? "bg-zinc-800 border-zinc-800 text-white"
                      : "border-zinc-200 hover:bg-zinc-100"
                  )}
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Ações */}
          <div className="flex items-center gap-1 border-t pt-2">
            {target.kind === "chord" && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={!target.canMoveLeft}
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
                  disabled={!target.canMoveRight}
                  onClick={() => onMoveChord("right")}
                  aria-label="Mover acorde para a direita"
                  className="px-2"
                >
                  ▶
                </Button>
              </>
            )}
            <div className="flex-1" />
            {target.kind !== "empty" && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="text-red-600 hover:text-red-600 px-2"
              >
                <TrashIcon size={13} className="mr-1" />
                Remover
              </Button>
            )}
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
