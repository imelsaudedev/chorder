import { createContext, useCallback, useContext, useState } from "react";
import { useArrangementUnitsFieldArray } from "../useArrangementForm";
import AddUnitForm from "./AddUnitForm";
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

type SongUnitListFormProps = {
  fieldPrefix?: string;
};

export default function SongUnitListForm({ fieldPrefix = "" }: SongUnitListFormProps) {
  const { units } = useArrangementUnitsFieldArray(fieldPrefix);
  const [activeInsert, setActiveInsertState] = useState<InsertFn | null>(null);
  const [customComment, setCustomComment] = useState("");

  // useState trata funções como updaters — precisa envolver em callback
  const setActiveInsert = useCallback((fn: InsertFn | null) => {
    setActiveInsertState(() => fn);
  }, []);

  const handleInsert = useCallback((text: string) => {
    activeInsert?.(text);
    setCustomComment("");
  }, [activeInsert]);

  const isActive = activeInsert !== null;

  return (
    <InstructionToolbarContext.Provider value={{ setActiveInsert }}>
      {units && units.length > 0 && (
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
          <div className={`flex flex-wrap items-center gap-2 px-4 sm:px-6 lg:px-8 py-2 transition-opacity ${isActive ? "opacity-100" : "opacity-30 pointer-events-none"}`}>
            <span className="text-xs text-muted-foreground shrink-0">Instrução:</span>
            {COMMENT_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); handleInsert(chip); }}
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
                  if (e.key === "Enter" && customComment.trim()) handleInsert(customComment.trim());
                }}
                placeholder="Personalizado..."
                className="text-xs border border-gray-200 rounded px-2 py-0.5 outline-none focus:border-gray-400 w-28"
              />
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); if (customComment.trim()) handleInsert(customComment.trim()); }}
                disabled={!customComment.trim()}
                className="text-xs px-2 py-0.5 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100 transition-colors"
              >
                OK
              </button>
            </div>
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
    </InstructionToolbarContext.Provider>
  );
}
