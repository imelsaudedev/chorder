"use client";

import {
  canMoveChord,
  getPrecedingComment,
  insertChord,
  moveChordOneStep,
  parseBlock,
  removeMarker,
  serializeBlock,
  setMarkerValue,
  toEditableLines,
  toggleChordComment,
} from "@/chopro/block-model";
import { parseChordPro } from "@/chopro/music";
import { MarkdownUnitForm } from "@/components/common/MarkdownUnitForm";
import TextInput from "@/components/common/TextInput";
import ChordProViewer from "@/components/song/ChordProViewer";
import { unitColorClasses } from "@/components/song/unit-colors";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClientSongUnit, SongUnitType } from "@/prisma/models";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  CopyIcon,
  MessageSquareIcon,
  MoreVertical,
  PenLineIcon,
  TrashIcon,
  XIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { ChangeEvent, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import BlockBody, { ItemCoords } from "./BlockBody";
import ChordModal from "./ChordModal";
import TypeSelector from "./TypeSelector";

type BlockShellProps = {
  unit: ClientSongUnit;
  number: number;
  isFirst: boolean;
  isLast: boolean;
  // D12: false quando este é o único bloco restante — Apagar fica desabilitado.
  canDelete: boolean;
  // D9: tom base do arranjo — o corpo visual nunca transpõe; o modal do
  // acorde (Etapa 4) monta a grade sempre a partir dele.
  baseKey: string;
  enharmonicPreference?: "sharp" | "flat" | null;
  onChangeType: (type: SongUnitType) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onInsertBefore: () => void;
  onInsertAfter: () => void;
  onRemove: () => void;
  onChangeNotes: (notes: string | null) => void;
  onChangeContent: (content: string) => void;
  className?: string;
};

// Casca do bloco (Etapa 2) + corpo visual tocável (Etapa 3 do PLANO.md).
// "Editar como texto" (menu do bloco) troca pro textarea+preview antigos —
// útil como modo de escape, mas o padrão agora é o corpo visual.
export default function BlockShell({
  unit,
  number,
  isFirst,
  isLast,
  canDelete,
  baseKey,
  enharmonicPreference = null,
  onChangeType,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onInsertBefore,
  onInsertAfter,
  onRemove,
  onChangeNotes,
  onChangeContent,
  className,
}: BlockShellProps) {
  const t = useTranslations();
  const colorClasses = unitColorClasses[unit.type];
  const contentId = useId();
  const [notesExpanded, setNotesExpanded] = useState(!!unit.notes);
  // Bloco TEXT nunca tem corpo visual de acordes (sempre MarkdownUnitForm);
  // pra tipos normais, texto é só uma saída temporária via menu — Etapa 5
  // decide o critério definitivo de quando abrir direto em modo texto
  // (bloco vazio/inválido).
  const [textMode, setTextMode] = useState(false);

  // Seleção do corpo visual + modal do acorde (Etapa 4). A coordenada
  // (lineIndex, itemIndex) é do corpo visual (chordsheetjs, Etapa 3); a cada
  // render ela é resolvida de novo contra o block-model (Etapa 1) via
  // toEditableLines, então nunca fica com um índice de token obsoleto depois
  // de uma edição — ver chopro/block-model.ts.
  const [selectedItem, setSelectedItem] = useState<ItemCoords | null>(null);
  const anchorElRef = useRef<HTMLElement | null>(null);
  const blockRef = useRef<HTMLDivElement>(null);
  const [blockWidth, setBlockWidth] = useState<number | null>(null);

  useEffect(() => {
    const el = blockRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setBlockWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleSelectItem = useCallback(
    (coords: ItemCoords, element: HTMLButtonElement) => {
      const isSame =
        selectedItem && selectedItem.lineIndex === coords.lineIndex && selectedItem.itemIndex === coords.itemIndex;
      if (isSame) {
        setSelectedItem(null);
        return;
      }

      const model = parseBlock(unit.content);
      const resolved = toEditableLines(model)[coords.lineIndex]?.[coords.itemIndex];
      // 8.4: tocar numa palavra sem acorde já insere o acorde do tom (I) e
      // seleciona; se já houver acorde, só seleciona.
      if (resolved?.kind === "pair" && resolved.chordTokenIndex === null && resolved.insertAt) {
        const updated = insertChord(model, resolved.insertAt.textTokenIndex, resolved.insertAt.offset, baseKey);
        onChangeContent(serializeBlock(updated));
      }
      anchorElRef.current = element;
      setSelectedItem(coords);
    },
    [selectedItem, unit.content, baseKey, onChangeContent]
  );

  // O clique original fica com o <button> de antes da edição — quando o
  // conteúdo muda, BlockBody refaz o DOM inteiro e esse nó é removido. Sem
  // isto, o Popover ficaria ancorado num elemento morto depois da primeira
  // troca de acorde/convenção/mover.
  useEffect(() => {
    if (!selectedItem) return;
    const selector = `[data-block-item="${selectedItem.lineIndex}-${selectedItem.itemIndex}"]`;
    const fresh = blockRef.current?.querySelector<HTMLElement>(selector);
    if (fresh) anchorElRef.current = fresh;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem, unit.content]);

  const selectedResolved = useMemo(() => {
    if (!selectedItem) return null;
    const model = parseBlock(unit.content);
    const resolved = toEditableLines(model)[selectedItem.lineIndex]?.[selectedItem.itemIndex];
    if (!resolved || resolved.kind !== "pair" || resolved.chordTokenIndex === null) return null;
    return { model, item: resolved, chordTokenIndex: resolved.chordTokenIndex };
  }, [selectedItem, unit.content]);

  const applyModelChange = useCallback(
    (updated: ReturnType<typeof parseBlock>) => onChangeContent(serializeBlock(updated)),
    [onChangeContent]
  );

  const isTextUnit = unit.type === "TEXT";
  const { hasError } = useMemo(() => {
    if (isTextUnit) return { hasError: false };
    try {
      parseChordPro(unit.content);
      return { hasError: false };
    } catch {
      return { hasError: true };
    }
  }, [unit.content, isTextUnit]);

  const handleChangeChordpro = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => onChangeContent(event.target.value),
    [onChangeContent]
  );

  const handleChangeNotes = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => onChangeNotes(event.target.value || null),
    [onChangeNotes]
  );

  const handleClearNotes = useCallback(() => {
    onChangeNotes(null);
    setNotesExpanded(false);
  }, [onChangeNotes]);

  return (
    <div
      ref={blockRef}
      className={`border ${colorClasses.border} ${colorClasses.background} rounded-lg p-2 md:p-4 mb-2 ${className || ""}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <TypeSelector value={unit.type} number={number} onChange={onChangeType} />

        {notesExpanded && (
          <div className={`inline-flex items-center gap-1 rounded px-2 py-1 border ${colorClasses.border} bg-white`}>
            <MessageSquareIcon size={11} className={`shrink-0 ${colorClasses.text}`} />
            <span className="relative inline-flex items-center min-w-[4rem]">
              <span className="invisible whitespace-pre text-xs pointer-events-none" aria-hidden>
                {unit.notes || t("UnitData.notesPlaceholder")}
              </span>
              <input
                type="text"
                className={`absolute inset-0 w-full bg-transparent text-xs outline-none ${colorClasses.text} placeholder:opacity-50`}
                value={unit.notes ?? ""}
                onChange={handleChangeNotes}
                placeholder={t("UnitData.notesPlaceholder")}
              />
            </span>
            <button
              type="button"
              onClick={handleClearNotes}
              className={`shrink-0 ${colorClasses.text} opacity-60 hover:opacity-100`}
            >
              <XIcon size={11} />
            </button>
          </div>
        )}

        <div className="flex-1" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Mais opções do bloco"
              className="p-1 text-zinc-400 hover:text-zinc-600 rounded transition-colors shrink-0"
            >
              <MoreVertical size={14} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled={isFirst} onClick={onMoveUp} className="text-xs cursor-pointer">
              <ChevronUp size={13} className="mr-1.5" />
              Subir
            </DropdownMenuItem>
            <DropdownMenuItem disabled={isLast} onClick={onMoveDown} className="text-xs cursor-pointer">
              <ChevronDown size={13} className="mr-1.5" />
              Descer
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onInsertBefore} className="text-xs cursor-pointer">
              <ArrowUp size={13} className="mr-1.5" />
              Inserir acima
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onInsertAfter} className="text-xs cursor-pointer">
              <ArrowDown size={13} className="mr-1.5" />
              Inserir abaixo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate} className="text-xs cursor-pointer">
              <CopyIcon size={13} className="mr-1.5" />
              {t("Messages.duplicate")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setNotesExpanded((v) => !v)}
              className="text-xs cursor-pointer"
            >
              <MessageSquareIcon size={13} className="mr-1.5" />
              Notas do bloco
            </DropdownMenuItem>
            {!isTextUnit && (
              <DropdownMenuItem
                onClick={() => setTextMode((v) => !v)}
                className="text-xs cursor-pointer"
              >
                <PenLineIcon size={13} className="mr-1.5" />
                {textMode ? "Editar visual" : "Editar como texto"}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={!canDelete}
              onClick={onRemove}
              title={canDelete ? undefined : "Não é possível apagar o único bloco restante"}
              className="text-xs cursor-pointer text-red-600 focus:text-red-600"
            >
              <TrashIcon size={13} className="mr-1.5" />
              {t("Messages.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isTextUnit ? (
        <MarkdownUnitForm initialContent={unit.content} onChange={onChangeContent} />
      ) : textMode ? (
        <div className="lg:grid lg:grid-cols-2 gap-4 flex flex-col">
          <div className="lg:flex lg:flex-col">
            <TextInput
              id={contentId}
              className="resize-none lg:flex-1 bg-white font-mono"
              onChange={handleChangeChordpro}
              value={unit.content}
              minRows={1}
              long
            />
          </div>
          <div
            className="rounded-md bg-black/5 px-2 py-2"
            style={{
              "--item-mb": "0.5em",
              "--block-px": "0",
              "--block-pt": "0",
            } as React.CSSProperties}
          >
            {hasError ? (
              <p className="text-red-500 text-sm">{t("Messages.invalidChordPro")}</p>
            ) : (
              <ChordProViewer chordpro={unit.content} density="compact" commentClass={colorClasses.comment} />
            )}
          </div>
        </div>
      ) : (
        <BlockBody
          content={unit.content}
          commentClass={colorClasses.comment}
          selected={selectedItem}
          onSelectItem={handleSelectItem}
        />
      )}

      {selectedResolved && (
        <ChordModal
          open
          anchorRef={anchorElRef}
          blockWidth={blockWidth}
          baseKey={baseKey}
          enharmonicPreference={enharmonicPreference}
          item={selectedResolved.item}
          activeComment={getPrecedingComment(selectedResolved.model, selectedResolved.chordTokenIndex)?.value ?? null}
          canMoveLeft={canMoveChord(selectedResolved.model, selectedResolved.chordTokenIndex, "left")}
          canMoveRight={canMoveChord(selectedResolved.model, selectedResolved.chordTokenIndex, "right")}
          onApplyChord={(value) =>
            applyModelChange(setMarkerValue(selectedResolved.model, selectedResolved.chordTokenIndex, value))
          }
          onRemoveChord={() => {
            applyModelChange(removeMarker(selectedResolved.model, selectedResolved.chordTokenIndex));
            setSelectedItem(null);
          }}
          onMoveChord={(direction) =>
            applyModelChange(moveChordOneStep(selectedResolved.model, selectedResolved.chordTokenIndex, direction))
          }
          onToggleComment={(value) => {
            // Inserir/remover a convenção desloca o índice do acorde na
            // mesma linha em +1/-1 (um item novo nasce ou um item some antes
            // dele) — sem isto, selectedItem fica apontando pro item errado
            // depois da troca (achado em teste, não hipotético).
            const preceding = getPrecedingComment(selectedResolved.model, selectedResolved.chordTokenIndex);
            applyModelChange(toggleChordComment(selectedResolved.model, selectedResolved.chordTokenIndex, value));
            if (!preceding) {
              setSelectedItem((prev) => (prev ? { ...prev, itemIndex: prev.itemIndex + 1 } : prev));
            } else if (preceding.value === value) {
              setSelectedItem((prev) => (prev ? { ...prev, itemIndex: prev.itemIndex - 1 } : prev));
            }
          }}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
