import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useArrangementUnitsFieldArray } from "../useArrangementForm";
import AddUnitForm from "./AddUnitForm";
import ChordPickerPanel from "./ChordPickerPanel";
import SortableUnitForm from "./SortableUnitForm";

const COMMENT_CHIPS = ["Pausa", "Forte", "Suave", "Crescendo", "Só voz", "Só base", "Rall."];

type InsertFn = (text: string) => void;

type InstructionToolbarContextValue = {
  setActiveInsert: (fn: InsertFn | null) => void;
};

const InstructionToolbarContext = createContext<InstructionToolbarContextValue>({
  setActiveInsert: () => {},
});

export function useInstructionToolbar() {
  return useContext(InstructionToolbarContext);
}

type ActivePanel = "chord" | "instruction" | null;

type SongUnitListFormProps = {
  fieldPrefix?: string;
};

export default function SongUnitListForm({ fieldPrefix = "" }: SongUnitListFormProps) {
  const { units } = useArrangementUnitsFieldArray(fieldPrefix);
  const { watch } = useFormContext();
  const currentKey = (watch(`${fieldPrefix}key`) as string) || "C";

  const [activeInsert, setActiveInsertState] = useState<InsertFn | null>(null);
  const [customComment, setCustomComment] = useState("");
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

  // useState trata funções como updaters — precisa envolver em callback
  const setActiveInsert = useCallback((fn: InsertFn | null) => {
    setActiveInsertState(() => fn);
  }, []);

  // Fecha o painel quando nenhuma textarea está ativa
  const isActive = activeInsert !== null;
  useEffect(() => {
    if (!isActive) setActivePanel(null);
  }, [isActive]);

  const handleInsert = useCallback((tag: string) => {
    activeInsert?.(tag);
    setCustomComment("");
  }, [activeInsert]);

  const handleChordSelect = useCallback((chord: string) => {
    activeInsert?.(`[${chord}]`);
    setActivePanel(null);
  }, [activeInsert]);

  const togglePanel = useCallback((panel: ActivePanel) => {
    setActivePanel((prev) => (prev === panel ? null : panel));
  }, []);

  const hasUnits = units && units.length > 0;

  return (
    <InstructionToolbarContext.Provider value={{ setActiveInsert }}>
      {hasUnits && (
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
          <div
            className={`flex flex-wrap items-center gap-2 px-4 sm:px-6 lg:px-8 py-2 transition-opacity ${
              isActive ? "opacity-100" : "opacity-30 pointer-events-none"
            }`}
          >
            {/* Botões de modo */}
            <button
              type="button"
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => togglePanel("chord")}
              className={`text-xs px-2.5 py-0.5 rounded border transition-colors font-mono font-semibold ${
                activePanel === "chord"
                  ? "bg-zinc-800 border-zinc-800 text-white"
                  : "border-zinc-300 text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              [Cifra]
            </button>
            <button
              type="button"
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => togglePanel("instruction")}
              className={`text-xs px-2.5 py-0.5 rounded border transition-colors ${
                activePanel === "instruction"
                  ? "bg-zinc-800 border-zinc-800 text-white"
                  : "border-zinc-300 text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              {"{Instrução}"}
            </button>

            {/* Chips de instrução */}
            {activePanel === "instruction" && (
              <>
                <div className="w-px h-4 bg-zinc-200" />
                {COMMENT_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onPointerDown={(e) => e.preventDefault()}
                    onClick={() => handleInsert(`{c:${chip}}`)}
                    className="text-xs px-2 py-0.5 rounded border border-gray-300 hover:bg-gray-100 transition-colors"
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
                      if (e.key === "Enter" && customComment.trim()) {
                        handleInsert(`{c:${customComment.trim()}}`);
                      }
                    }}
                    placeholder="Personalizado..."
                    className="text-xs border border-gray-200 rounded px-2 py-0.5 outline-none focus:border-gray-400 w-28"
                  />
                  <button
                    type="button"
                    onPointerDown={(e) => e.preventDefault()}
                    onClick={() => {
                      if (customComment.trim()) handleInsert(`{c:${customComment.trim()}}`);
                    }}
                    disabled={!customComment.trim()}
                    className="text-xs px-2 py-0.5 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100 transition-colors"
                  >
                    OK
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <section className="px-4 sm:px-6 lg:px-8 py-8 space-y-2">
        {units?.map((unit, index) => (
          <SortableUnitForm
            key={`${unit.id}--${index}`}
            unit={unit}
            index={index}
            fieldPrefix={fieldPrefix}
          />
        ))}
        <AddUnitForm fieldPrefix={fieldPrefix} />
      </section>

      {/* Painel de cifras — fixo na base da viewport */}
      {hasUnits && activePanel === "chord" && isActive && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <ChordPickerPanel
            currentKey={currentKey}
            onSelectChord={handleChordSelect}
            onClose={() => setActivePanel(null)}
          />
        </div>
      )}
    </InstructionToolbarContext.Provider>
  );
}
