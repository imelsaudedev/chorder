"use client";

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
import { ChangeEvent, useCallback, useId, useMemo, useState } from "react";
import TypeSelector from "./TypeSelector";

type BlockShellProps = {
  unit: ClientSongUnit;
  number: number;
  isFirst: boolean;
  isLast: boolean;
  // D12: false quando este é o único bloco restante — Apagar fica desabilitado.
  canDelete: boolean;
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

// Casca do bloco (Etapa 2 do PLANO.md): cabeçalho com seletor de tipo e menu,
// corpo ainda com o textarea + preview antigos — a Etapa 3 troca só o corpo
// por uma renderização tocável, sem precisar mexer neste arquivo de novo.
export default function BlockShell({
  unit,
  number,
  isFirst,
  isLast,
  canDelete,
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
  // Por ora não há corpo visual (Etapa 3) pra alternar com o texto — o
  // estado já existe pra o menu não precisar ser refeito quando ele chegar.
  const [textMode, setTextMode] = useState(true);

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
      ) : (
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
      )}
    </div>
  );
}
