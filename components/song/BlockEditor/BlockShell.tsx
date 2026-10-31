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
  GripVertical,
  MessageSquareIcon,
  MoreVertical,
  Pointer,
  TrashIcon,
  Type,
  XIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { ChangeEvent, useCallback, useId, useMemo, useState } from "react";
import BlockBody from "./BlockBody";
import TypeSelector from "./TypeSelector";

// Seção 8.5 / critério 10: bloco vazio ou com erro de parse abre direto em
// modo texto — não há nada tocável num bloco assim, então o corpo visual
// não tem como oferecer uma entrada de edição.
function hasParseError(content: string): boolean {
  try {
    parseChordPro(content);
    return false;
  } catch {
    return true;
  }
}

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
  const isTextUnit = unit.type === "TEXT";
  // Bloco TEXT nunca tem corpo visual de acordes (sempre MarkdownUnitForm).
  // Pros demais: bloco em branco (novo, ou conteúdo só espaço/vazio) nasce
  // em modo TEXTO — decisão explícita: colar a letra pronta é o caso mais
  // comum de começar um bloco do zero, e com o toggle visível no cabeçalho
  // a troca pro visual é um toque, não precisa adivinhar certo de cara.
  // Bloco com conteúdo real (carregado do banco) sempre abre no visual,
  // que é o padrão da edição normal; erro de parse (8.5) também cai pro
  // texto, já que não há nada tocável num conteúdo inválido. Só no mount —
  // depois disso é o toggle do cabeçalho que decide, não isto de novo.
  const [textMode, setTextMode] = useState(
    () => !isTextUnit && (unit.content.trim() === "" || hasParseError(unit.content))
  );

  const hasError = useMemo(
    () => !isTextUnit && hasParseError(unit.content),
    [unit.content, isTextUnit]
  );

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
      // borderHandleHover (:has() — ver unit-colors.ts) acende a borda do
      // bloco INTEIRO quando o mouse passa só na alça de arrastar, achado:
      // "é possível que o hover dela acenda a borda de todo o bloco? Usaria
      // a mesma gradação de cor da borda, mais vivo e mais grosso". A alça
      // ainda não arrasta nada — só a casca visual por enquanto.
      className={`border ${colorClasses.border} ${colorClasses.background} ${colorClasses.borderHandleHover} rounded-lg p-2 md:p-4 mb-2 transition-[border-color,border-width] ${className || ""}`}
    >
      {/* Notas numa linha PRÓPRIA, acima dos ícones — achado em teste
          manual: colada na mesma linha que o TypeSelector/ícones, sem teto
          de largura nenhum, a nota estourava a largura do bloco (min-w-[4rem]
          só dava um PISO, nunca um limite). min-w-0 (não é o default de um
          filho flex) deixa o campo encolher/quebrar dentro do espaço real
          do bloco em vez de empurrar os vizinhos pra fora dele. */}
      {notesExpanded && (
        <div className={`flex items-center gap-1 rounded px-2 py-1 mb-2 border ${colorClasses.border} bg-white`}>
          <MessageSquareIcon size={11} className={`shrink-0 ${colorClasses.text}`} />
          <span className="relative flex-1 min-w-0 inline-flex items-center">
            <span className="invisible whitespace-pre-wrap break-words text-xs pointer-events-none" aria-hidden>
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
            className={`shrink-0 cursor-pointer ${colorClasses.text} opacity-60 hover:opacity-100`}
          >
            <XIcon size={11} />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 mb-2">
        {/* Alça de arrastar — não o bloco inteiro (achado: "o bloco tem
            acorde tocável, texto selecionável, menu... pegar em qualquer
            lugar brigaria com isso"). Ainda só casca visual: cursor e o
            aceso da borda (borderHandleHover acima); o arrasto de verdade
            entra numa etapa seguinte do plano. */}
        <button
          type="button"
          data-drag-handle
          aria-label="Mover bloco (arraste ou use o menu)"
          title="Mover bloco (arraste ou use o menu)"
          className="p-1 text-zinc-400 hover:text-zinc-600 rounded transition-colors shrink-0 cursor-grab active:cursor-grabbing"
        >
          <GripVertical size={14} />
        </button>

        <TypeSelector value={unit.type} number={number} onChange={onChangeType} />

        <div className="flex-1" />

        {/* Toggle visível visual/texto, fora do menu de três pontinhos —
            achado em discussão: o modo era uma troca tão barata (um clique)
            que não fazia sentido escondê-la atrás de um menu; deixar os
            dois caminhos (começar pelo acorde no visual, ou colar a letra
            pronta no texto) sempre à vista remove a necessidade de acertar
            um "modo padrão" pro bloco novo. Ícone mostra o MODO PRA ONDE o
            clique leva: Pointer (apontar/tocar) pro visual, Type (digitar)
            pro texto. */}
        {!isTextUnit && (
          <button
            type="button"
            onClick={() => setTextMode((v) => !v)}
            aria-label={textMode ? "Editar visual" : "Editar como texto"}
            title={textMode ? "Editar visual" : "Editar como texto"}
            className="p-1 text-zinc-400 hover:text-zinc-600 rounded transition-colors shrink-0 cursor-pointer"
          >
            {textMode ? <Pointer size={14} /> : <Type size={14} />}
          </button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Mais opções do bloco"
              className="p-1 text-zinc-400 hover:text-zinc-600 rounded transition-colors shrink-0 cursor-pointer"
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
        // Achado: lado a lado não pode depender da largura da TELA (lg:) —
        // o bloco vive dentro de uma coluna (1 a 4, ver useResponsiveColumns),
        // então a tela pode estar larga e a coluna mesmo assim estreita.
        // @container reage à largura real do BLOCO, não da viewport (Tailwind
        // v4 já suporta nativo, sem plugin) — um elemento não pode reagir à
        // própria largura, por isso o wrapper "@container" fica por fora e
        // o "@lg:" por dentro, num filho.
        <div className="@container">
          <div className="@lg:grid @lg:grid-cols-2 gap-4 flex flex-col">
            <div className="@lg:flex @lg:flex-col">
              <TextInput
                id={contentId}
                className="resize-none @lg:flex-1 bg-white font-mono"
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
        </div>
      ) : (
        <BlockBody
          content={unit.content}
          onChangeContent={onChangeContent}
          baseKey={baseKey}
          enharmonicPreference={enharmonicPreference}
          commentClass={colorClasses.comment}
          chipClassName={colorClasses.repeatBadge}
        />
      )}
    </div>
  );
}
