"use client";

import { ChordVariant, buildChordGrid } from "@/chopro/chord-grid";
import { transposeChord } from "@/chopro/music";
import { SongConfigContext } from "@/components/config/SongConfig";
import KeyButtonSet from "@/components/config/KeyButtonSet";
import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useContext, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useInstructionToolbar } from ".";

const COMMENT_CHIPS = [
  "Pausa", "Forte", "Suave", "Crescendo", "Só voz", "Só base", "Rall.",
];

type ChordSidebarProps = {
  fieldPrefix?: string;
};

export default function ChordSidebar({ fieldPrefix = "" }: ChordSidebarProps) {
  const { watch } = useFormContext();
  const baseKey = (watch(`${fieldPrefix}key`) as string) || "C";
  const songConfig = useContext(SongConfigContext);
  const currentKey = transposeChord(baseKey, baseKey, songConfig?.transpose ?? 0);
  const { activeInsert } = useInstructionToolbar();

  const [expanded, setExpanded] = useState(true);
  const [flashCell, setFlashCell] = useState<string | null>(null);
  const [customComment, setCustomComment] = useState("");

  const grid = useMemo(() => buildChordGrid(currentKey), [currentKey]);
  const isActive = activeInsert !== null;

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

  const handleInstruction = useCallback(
    (text: string) => {
      activeInsert?.(`{c:${text}}`);
      setCustomComment("");
    },
    [activeInsert]
  );

  return (
    <aside
      className={clsx(
        "hidden md:flex flex-col shrink-0 transition-[width] duration-200",
        expanded ? "w-72" : "w-36",
        "sticky top-6 self-start",
        "max-h-[calc(100dvh-3rem)] overflow-hidden",
        "rounded-lg border border-zinc-200 bg-zinc-100",
      )}
    >
      {/* Cabeçalho */}
      <div className="flex items-center px-3 py-2 border-b border-zinc-200 shrink-0 gap-2">
        {expanded && <span className="text-xs font-medium text-zinc-500 flex-1">Dicionário</span>}
        {expanded && songConfig && (
          <KeyButtonSet
            originalKey={baseKey}
            transpose={songConfig.transpose}
            setTranspose={songConfig.setTranspose}
          />
        )}
        <button
          type="button"
          onPointerDown={(e) => e.preventDefault()}
          onClick={() => setExpanded((v) => !v)}
          className="text-zinc-400 hover:text-zinc-700 cursor-pointer transition-colors"
        >
          {expanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      {/* Grid de acordes */}
      <div
        className={clsx(
          "overflow-y-auto px-2 pt-2 transition-opacity",
          !isActive && "opacity-35"
        )}
      >
        <table className="w-full table-fixed border-separate border-spacing-[2px]">
          <thead>
            <tr>
              <ColHeader>Tríade</ColHeader>
              <ColHeader>7ª</ColHeader>
              {expanded && <ColHeader>Inv.</ColHeader>}
              {expanded && <ColHeader>Var.</ColHeader>}
            </tr>
          </thead>
          <tbody>
            {grid.map((row, i) => (
              <tr key={i}>
                <GridCell chord={row.triad} variant="normal" flash={flashCell} onSelect={handleChordSelect} />
                <GridCell chord={row.seventh} variant="normal" flash={flashCell} onSelect={handleChordSelect} />
                {expanded && (
                  <GridCell
                    chord={row.slash}
                    variant={row.slash ? "slash" : "empty"}
                    flash={flashCell}
                    onSelect={handleChordSelect}
                  />
                )}
                {expanded && (
                  <GridCell
                    chord={row.variante}
                    variant={row.variante ? toVariant(row.varType) : "empty"}
                    flash={flashCell}
                    onSelect={handleChordSelect}
                  />
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Instruções */}
      <div
        className={clsx(
          "px-2 pt-3 pb-2 shrink-0 transition-opacity",
          !isActive && "opacity-35"
        )}
      >
        <p className="text-[9px] font-medium text-zinc-400 uppercase tracking-wide mb-1.5">
          Instruções
        </p>
        <div className="flex flex-wrap gap-1">
          {COMMENT_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => handleInstruction(chip)}
              className="text-xs px-2 py-1 rounded border border-zinc-200 bg-white shadow-xs hover:bg-zinc-50 transition-colors text-zinc-700"
            >
              {chip}
            </button>
          ))}
        </div>
        <div className={clsx("flex gap-1 mt-1.5 pb-1", !expanded && "flex-col")}>
          <input
            type="text"
            value={customComment}
            onChange={(e) => setCustomComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (customComment.trim()) handleInstruction(customComment.trim());
              }
            }}
            placeholder="Personalizado…"
            className="text-xs border border-zinc-200 bg-white shadow-xs rounded px-2 py-1 outline-none focus:border-zinc-400 flex-1 min-w-0"
          />
          <button
            type="button"
            onPointerDown={(e) => e.preventDefault()}
            onClick={() => {
              if (customComment.trim()) handleInstruction(customComment.trim());
            }}
            disabled={!customComment.trim()}
            className="text-xs px-2 py-1 rounded border border-zinc-200 bg-white shadow-xs hover:bg-zinc-50 disabled:opacity-40 transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </aside>
  );
}

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function ColHeader({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-[9px] font-normal text-zinc-400 text-center pb-1">
      {children}
    </th>
  );
}

type CellVariant = "normal" | "slash" | "secdom" | "aem" | "empty";

function toVariant(varType: ChordVariant): CellVariant {
  if (varType === "secdom") return "secdom";
  if (varType === "aem") return "aem";
  return "slash";
}

type GridCellProps = {
  chord: string | null;
  variant: CellVariant;
  flash: string | null;
  onSelect: (chord: string) => void;
};

function GridCell({ chord, variant, flash, onSelect }: GridCellProps) {
  if (!chord || variant === "empty") {
    return <td className="h-7 rounded bg-zinc-200" />;
  }

  const isFlashing = flash === chord;

  return (
    <td
      className={clsx(
        "h-7 rounded text-center text-xs font-mono font-semibold",
        "cursor-pointer select-none transition-colors align-middle",
        {
          "bg-white border border-zinc-200 shadow-xs hover:bg-zinc-50 text-zinc-800": variant === "normal" && !isFlashing,
          "bg-white border border-dashed border-zinc-300 shadow-xs hover:bg-zinc-50 text-zinc-700": variant === "slash" && !isFlashing,
          "bg-amber-50 border border-amber-200 shadow-xs hover:bg-amber-100 text-amber-800": variant === "secdom" && !isFlashing,
          "bg-white border border-dashed border-violet-200 shadow-xs hover:bg-violet-50 text-violet-700": variant === "aem" && !isFlashing,
          "bg-zinc-400 text-white": isFlashing,
        }
      )}
      onPointerDown={(e) => e.preventDefault()}
      onClick={() => onSelect(chord)}
    >
      {chord}
    </td>
  );
}
