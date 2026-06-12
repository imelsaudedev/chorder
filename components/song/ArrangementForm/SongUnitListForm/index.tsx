import { applyEnharmonicToGrid, buildChordGrid } from "@/chopro/chord-grid";
import { transposeChord } from "@/chopro/music";
import { SongConfigContext } from "@/components/config/SongConfig";
import KeyButtonSet from "@/components/config/KeyButtonSet";
import clsx from "clsx";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useArrangementUnitsFieldArray } from "../useArrangementForm";
import AddUnitForm from "./AddUnitForm";
import ChordSidebar from "./ChordSidebar";
import SortableUnitForm from "./SortableUnitForm";

const COMMENT_CHIPS = [
  "Pausa", "Forte", "Suave", "Crescendo", "Só voz", "Só base", "Rall.",
];

type InsertFn = (tag: string) => void;

type InstructionToolbarContextValue = {
  activeInsert: InsertFn | null;
  setActiveInsert: (fn: InsertFn | null) => void;
};

const InstructionToolbarContext = createContext<InstructionToolbarContextValue>({
  activeInsert: null,
  setActiveInsert: () => {},
});

export function useInstructionToolbar() {
  return useContext(InstructionToolbarContext);
}

type ActivePanel = "chord" | "instruction" | null;

type SongUnitListFormProps = {
  fieldPrefix?: string;
  sectionClassName?: string;
  toolbarClassName?: string;
};

export default function SongUnitListForm({ fieldPrefix = "", sectionClassName, toolbarClassName = "px-4" }: SongUnitListFormProps) {
  const { units } = useArrangementUnitsFieldArray(fieldPrefix);
  const { watch } = useFormContext();
  const baseKey = (watch(`${fieldPrefix}key`) as string) || "C";
  const songConfig = useContext(SongConfigContext);
  const currentKey = transposeChord(baseKey, baseKey, songConfig?.transpose ?? 0);

  const [activeInsert, setActiveInsertState] = useState<InsertFn | null>(null);
  const [customComment, setCustomComment] = useState("");
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [flashCell, setFlashCell] = useState<string | null>(null);

  const rawGrid = useMemo(() => buildChordGrid(currentKey), [currentKey]);
  const grid = useMemo(() => applyEnharmonicToGrid(rawGrid, songConfig?.enharmonicPreference ?? null), [rawGrid, songConfig?.enharmonicPreference]);

  // useState trata funções como updaters — precisa envolver em callback
  const setActiveInsert = useCallback((fn: InsertFn | null) => {
    setActiveInsertState(() => fn);
  }, []);

  // Fecha painel mobile quando nenhuma textarea está ativa
  const isActive = activeInsert !== null;
  useEffect(() => {
    if (!isActive) setActivePanel(null);
  }, [isActive]);

  const handleInsert = useCallback(
    (tag: string) => {
      activeInsert?.(tag);
      setCustomComment("");
    },
    [activeInsert]
  );

  const handleChordSelect = useCallback(
    (chord: string) => {
      setFlashCell(chord);
      setTimeout(() => {
        setFlashCell(null);
        activeInsert?.(`[${chord}]`);
      }, 120);
    },
    [activeInsert]
  );

  const togglePanel = useCallback((panel: ActivePanel) => {
    setActivePanel((prev) => (prev === panel ? null : panel));
  }, []);

  const hasUnits = units && units.length > 0;

  return (
    <InstructionToolbarContext.Provider value={{ activeInsert, setActiveInsert }}>

      {/* Toolbar mobile — oculta em md+ e enquanto nenhum textarea estiver focado */}
      {hasUnits && isActive && (
        <div
          className="sticky z-10 bg-white border-b border-gray-100 md:hidden"
          style={{ top: "var(--song-header-h, 0px)" }}
        >
          <div className={`flex flex-wrap items-center gap-2 py-2 ${toolbarClassName}`}>
            <button
              type="button"
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => togglePanel("chord")}
              className={`text-xs px-2 py-1 rounded border transition-colors font-mono font-semibold ${
                activePanel === "chord"
                  ? "bg-zinc-800 border-zinc-800 text-white"
                  : "border-zinc-200 text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              [Cifra]
            </button>
            <button
              type="button"
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => togglePanel("instruction")}
              className={`text-xs px-2 py-1 rounded border transition-colors ${
                activePanel === "instruction"
                  ? "bg-zinc-800 border-zinc-800 text-white"
                  : "border-zinc-200 text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              {"{Instrução}"}
            </button>

            {activePanel === "chord" && (
              <>
                <div className="w-px h-4 bg-zinc-200 shrink-0" />
                {songConfig && (
                  <KeyButtonSet
                    originalKey={baseKey}
                    transpose={songConfig.transpose}
                    setTranspose={songConfig.setTranspose}
                    size="sm"
                  />
                )}
                <div className="w-px h-4 bg-zinc-200 shrink-0" />
                {grid.flatMap((row) => [row.triad, row.seventh]).map((chord) => (
                  <button
                    key={chord}
                    type="button"
                    onPointerDown={(e) => e.preventDefault()}
                    onClick={() => handleChordSelect(chord)}
                    className={clsx(
                      "text-xs px-2 py-1 rounded border font-mono font-semibold transition-colors",
                      flashCell === chord
                        ? "bg-zinc-400 text-white border-zinc-400"
                        : "bg-white border-zinc-200 shadow-xs text-zinc-800 hover:bg-zinc-50"
                    )}
                  >
                    {chord}
                  </button>
                ))}
              </>
            )}

            {activePanel === "instruction" && (
              <>
                <div className="w-px h-4 bg-zinc-200" />
                {COMMENT_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onPointerDown={(e) => e.preventDefault()}
                    onClick={() => handleInsert(`{c:${chip}}`)}
                    className="text-xs px-2 py-1 rounded border border-zinc-200 hover:bg-zinc-100 transition-colors"
                  >
                    {chip}
                  </button>
                ))}
                <div className="flex gap-1 ml-auto">
                  <input
                    type="text"
                    value={customComment}
                    onChange={(e) => setCustomComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (customComment.trim()) handleInsert(`{c:${customComment.trim()}}`);
                      }
                    }}
                    placeholder="Personalizado..."
                    className="text-xs border border-zinc-200 rounded px-2 py-1 outline-none focus:border-zinc-400 w-28"
                  />
                  <button
                    type="button"
                    onPointerDown={(e) => e.preventDefault()}
                    onClick={() => {
                      if (customComment.trim()) handleInsert(`{c:${customComment.trim()}}`);
                    }}
                    disabled={!customComment.trim()}
                    className="text-xs px-2 py-1 rounded border border-zinc-200 disabled:opacity-40 hover:bg-zinc-100 transition-colors"
                  >
                    OK
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Conteúdo — sidebar à esquerda + units à direita, dentro do padding da página */}
      <section className={sectionClassName ?? "px-4 sm:px-6 lg:px-8 py-8"}>
        <div className="flex gap-4 items-start">
          {hasUnits && <ChordSidebar fieldPrefix={fieldPrefix} />}

          <div className="flex-1 min-w-0 space-y-2">
            {units?.map((unit, index) => (
              <SortableUnitForm
                key={`${unit.id}--${index}`}
                unit={unit}
                index={index}
                fieldPrefix={fieldPrefix}
              />
            ))}
            <AddUnitForm fieldPrefix={fieldPrefix} />
          </div>
        </div>
      </section>

    </InstructionToolbarContext.Provider>
  );
}
