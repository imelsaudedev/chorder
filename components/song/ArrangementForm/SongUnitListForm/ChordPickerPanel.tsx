"use client";

import { ChordRow, ChordVariant, buildChordGrid } from "@/chopro/chord-grid";
import clsx from "clsx";
import { X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

type ChordPickerPanelProps = {
  currentKey: string;
  onSelectChord: (chord: string) => void;
  onClose: () => void;
};

export default function ChordPickerPanel({
  currentKey,
  onSelectChord,
  onClose,
}: ChordPickerPanelProps) {
  const grid = useMemo(() => buildChordGrid(currentKey), [currentKey]);
  const [flashCell, setFlashCell] = useState<string | null>(null);

  const handleSelect = useCallback(
    (chord: string) => {
      setFlashCell(chord);
      setTimeout(() => {
        setFlashCell(null);
        onSelectChord(chord);
      }, 120);
    },
    [onSelectChord]
  );

  return (
    <div className="bg-white border-t border-zinc-200 shadow-2xl">
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-zinc-100">
        <span className="text-xs text-zinc-400">
          Tom: <span className="font-semibold text-zinc-700">{currentKey}</span>
        </span>
        <button
          type="button"
          onPointerDown={(e) => e.preventDefault()}
          onClick={onClose}
          className="p-1 text-zinc-400 hover:text-zinc-600"
        >
          <X size={14} />
        </button>
      </div>

      <div className="px-2 pt-1.5 pb-3">
        <table className="w-full border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="text-[10px] font-normal text-zinc-400 text-center pb-0.5">Tríade</th>
              <th className="text-[10px] font-normal text-zinc-400 text-center pb-0.5">Com 7ª</th>
              <th className="text-[10px] font-normal text-zinc-400 text-center pb-0.5 hidden sm:table-cell">Inversão</th>
              <th className="text-[10px] font-normal text-zinc-400 text-center pb-0.5 hidden sm:table-cell">Variante</th>
            </tr>
          </thead>
          <tbody>
            {grid.map((row, i) => (
              <tr key={i}>
                <ChordCell
                  chord={row.triad}
                  variant="normal"
                  flash={flashCell}
                  onSelect={handleSelect}
                />
                <ChordCell
                  chord={row.seventh}
                  variant="normal"
                  flash={flashCell}
                  onSelect={handleSelect}
                />
                <ChordCell
                  chord={row.slash}
                  variant={row.slash ? "slash" : "empty"}
                  flash={flashCell}
                  onSelect={handleSelect}
                  className="hidden sm:table-cell"
                />
                <ChordCell
                  chord={row.variante}
                  variant={row.variante ? variantType(row.varType) : "empty"}
                  flash={flashCell}
                  onSelect={handleSelect}
                  className="hidden sm:table-cell"
                />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function variantType(varType: ChordVariant): "slash" | "secdom" | "aem" {
  if (varType === "secdom") return "secdom";
  if (varType === "aem") return "aem";
  return "slash";
}

type CellVariant = "normal" | "slash" | "secdom" | "aem" | "empty";

type ChordCellProps = {
  chord: string | null;
  variant: CellVariant;
  flash: string | null;
  onSelect: (chord: string) => void;
  className?: string;
};

function ChordCell({ chord, variant, flash, onSelect, className }: ChordCellProps) {
  if (!chord || variant === "empty") {
    return <td className={clsx("h-7 rounded bg-zinc-50", className)} />;
  }

  const isFlashing = flash === chord;

  return (
    <td
      className={clsx(
        "h-7 rounded text-center text-xs font-mono font-semibold cursor-pointer select-none transition-colors align-middle",
        {
          "bg-zinc-100 hover:bg-zinc-200 text-zinc-800": variant === "normal" && !isFlashing,
          "bg-white border border-dashed border-zinc-300 hover:bg-zinc-50 text-zinc-700": variant === "slash" && !isFlashing,
          "bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-800": variant === "secdom" && !isFlashing,
          "bg-white border border-dashed border-violet-200 hover:bg-violet-50 text-violet-700": variant === "aem" && !isFlashing,
          "bg-zinc-300": isFlashing,
        },
        className
      )}
      onPointerDown={(e) => e.preventDefault()}
      onClick={() => onSelect(chord)}
    >
      {chord}
    </td>
  );
}
