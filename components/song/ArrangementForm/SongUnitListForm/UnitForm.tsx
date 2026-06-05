import { parseChordPro } from "@/chopro/music";
import { MarkdownUnitForm } from "@/components/common/MarkdownUnitForm";
import TextInput from "@/components/common/TextInput";
import BadgeSelector from "@/components/song/BadgeSelector";
import ChordProViewer from "@/components/song/ChordProViewer";
import { unitColorClasses } from "@/components/song/unit-colors";
import { Button } from "@/components/ui/button";
import { ClientSongUnit, SongUnitType } from "@/prisma/models";
import { CopyIcon, MessageSquareIcon, TrashIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { ChangeEvent, useCallback, useId, useMemo, useRef, useState } from "react";
import { useInstructionToolbar } from ".";

type UnitFormProps = {
  unit: ClientSongUnit;
  removeUnit: () => void;
  duplicateUnit: () => void;
  onChangeUnit: (unit: ClientSongUnit) => void;
  className?: string;
};

export default function UnitForm({
  unit,
  removeUnit,
  duplicateUnit,
  onChangeUnit,
  className,
}: UnitFormProps) {
  const t = useTranslations();

  const colorClasses = unitColorClasses[unit.type];
  const contentId = useId();
  const [notesExpanded, setNotesExpanded] = useState(!!unit.notes);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const insertRef = useRef<(text: string) => void>(() => {});

  // Atualiza ref a cada render para capturar unit/onChangeUnit frescos
  insertRef.current = (text: string) => {
    const textarea = textareaRef.current;
    const tag = `{c:${text}}`;
    const pos = textarea ? textarea.selectionStart : unit.content.length;
    const newContent = unit.content.slice(0, pos) + tag + unit.content.slice(pos);
    onChangeUnit({ ...unit, content: newContent });
    setTimeout(() => {
      textarea?.focus();
      textarea?.setSelectionRange(pos + tag.length, pos + tag.length);
    }, 0);
  };

  const { setActiveInsert } = useInstructionToolbar();
  const stableInsert = useCallback((text: string) => insertRef.current(text), []);
  const handleTextareaFocus = useCallback(() => setActiveInsert(stableInsert), [setActiveInsert, stableInsert]);

  const handleRemoveUnit = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      removeUnit();
    },
    [removeUnit]
  );

  const handleDuplicateUnit = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      duplicateUnit();
    },
    [duplicateUnit]
  );

  const handleChangeUnitType = useCallback(
    (newValue: string) => {
      onChangeUnit({ ...unit, type: newValue as SongUnitType });
    },
    [onChangeUnit, unit]
  );

  const handleChangeChordpro = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      onChangeUnit({ ...unit, content: event.target.value });
    },
    [onChangeUnit, unit]
  );

  // Verifica se o conteúdo do ChordPro é válido
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

  const handleMarkdownChange = useCallback(
    (content: string) => {
      onChangeUnit({ ...unit, content });
    },
    [onChangeUnit, unit]
  );

  const handleChangeNotes = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChangeUnit({ ...unit, notes: event.target.value || null });
    },
    [onChangeUnit, unit]
  );

  const handleClearNotes = useCallback(() => {
    onChangeUnit({ ...unit, notes: null });
    setNotesExpanded(false);
  }, [onChangeUnit, unit]);

  return (
    <div
      className={`border ${colorClasses.border} ${colorClasses.background} rounded-lg p-2 md:p-4 mb-2 ${className || ""}`}
    >
      <div className="mt-2">
        <BadgeSelector value={unit.type} onChange={handleChangeUnitType} />
      </div>

      <div className="mt-2">
        {notesExpanded ? (
          <div className={`flex items-center gap-1 rounded px-2 py-1 ${colorClasses.background} border ${colorClasses.border}`}>
            <MessageSquareIcon size={12} className={colorClasses.text} />
            <input
              type="text"
              className={`flex-1 bg-transparent text-xs outline-none placeholder:opacity-50 ${colorClasses.text}`}
              value={unit.notes ?? ""}
              onChange={handleChangeNotes}
              placeholder={t("UnitData.notesPlaceholder")}
            />
            <button type="button" onClick={handleClearNotes} className={`${colorClasses.text} opacity-60 hover:opacity-100`}>
              <XIcon size={12} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setNotesExpanded(true)}
            className={`text-xs opacity-50 hover:opacity-80 flex items-center gap-1 ${colorClasses.text}`}
          >
            <MessageSquareIcon size={11} />
            {t("UnitData.addNotes")}
          </button>
        )}
      </div>

      {isTextUnit ? (
        <div className="mt-4">
          <MarkdownUnitForm
            initialContent={unit.content}
            onChange={handleMarkdownChange}
          />
        </div>
      ) : (
        <div className="md:grid md:grid-cols-2 gap-4 flex flex-col mt-4">
          <div onFocus={handleTextareaFocus}>
            <TextInput
              ref={textareaRef}
              id={contentId}
              className="resize-none grow bg-white font-mono"
              placeholder={t("UnitData.contentPlaceholder")}
              onChange={handleChangeChordpro}
              value={unit.content}
              minRows={1}
              long
            />
          </div>
          <div className="rounded-md bg-black/5 px-2 py-2">
            {hasError ? (
              <p className="text-red-500 text-sm">
                {t("Messages.invalidChordPro")}
              </p>
            ) : (
              <ChordProViewer chordpro={unit.content} density="compact" commentClass={colorClasses.comment} />
            )}
          </div>
        </div>
      )}

      <div className="flex justify-end items-center mt-4 gap-2">
        <Button onClick={handleRemoveUnit} variant="ghost">
          <TrashIcon /> {t("Messages.delete")}
        </Button>
        <Button onClick={handleDuplicateUnit} variant="outline">
          <CopyIcon /> {t("Messages.duplicate")}
        </Button>
      </div>
    </div>
  );
}
