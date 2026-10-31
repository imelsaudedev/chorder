"use client";

import { Button } from "@/components/ui/button";
import { ClientSongUnit, SongUnitType } from "@/prisma/models";
import { autoScrollWindowForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import BlockShell from "./BlockShell";
import { distributeUnitsIntoColumns } from "./distributeUnits";
import { isSongUnitDragData } from "./dragData";
import {
  appendUnit,
  changeUnitType,
  duplicateUnit,
  insertUnitAfter,
  insertUnitBefore,
  moveUnitDown,
  moveUnitTo,
  moveUnitUp,
  removeUnit,
  setUnitContent,
  setUnitNotes,
} from "./unitListOperations";
import { computeUnitTypeNumbers } from "../unit-numbering";

type BlockEditorProps = {
  units: ClientSongUnit[];
  columns?: number;
  // D9: tom base do arranjo — nunca o tom transposto do culto. A grade do
  // modal do acorde (Etapa 4) é sempre montada a partir deste valor.
  baseKey: string;
  enharmonicPreference?: "sharp" | "flat" | null;
  onChangeUnits: (units: ClientSongUnit[]) => void;
};

// Substituto de SongUnitListForm (Etapa 2 do PLANO.md), conectado nos dois
// fluxos reais (Etapa 6). Colunas sempre dinâmicas (D2), recalculadas a
// cada mudança de conteúdo, reusando findBestDistribution sem alterá-lo via
// distributeUnitsIntoColumns.
export default function BlockEditor({
  units,
  columns = 1,
  baseKey,
  enharmonicPreference = null,
  onChangeUnits,
}: BlockEditorProps) {
  const t = useTranslations("SongForm");
  const numbers = useMemo(() => computeUnitTypeNumbers(units.map((u) => u.type)), [units]);
  const positionedColumns = useMemo(
    () => distributeUnitsIntoColumns(units, columns),
    [units, columns]
  );

  const canDelete = units.length > 1;

  // Arrastar e soltar (Trello-like, D4 revisto): Subir/Descer continuam
  // existindo, isto é só um segundo jeito de mover. autoScrollWindowForElements
  // rola a PÁGINA (não um container próprio) perto da borda durante o
  // arrasto — precisa viver aqui, não em cada BlockShell, senão registraria
  // um monitor de rolagem por bloco. O resto do mecanismo (fonte de
  // arrasto + alvo por bloco) está em BlockShell.tsx; os alvos por COLUNA
  // (soltar no fim/numa coluna vazia) estão em ColumnDropZone abaixo.
  useEffect(() => autoScrollWindowForElements(), []);

  function handleMoveUnit(fromIndex: number, toIndex: number) {
    onChangeUnits(moveUnitTo(units, fromIndex, toIndex));
  }

  // offset acumulado: cada coluna é só um RECORTE do array único de units
  // (distributeUnits.ts) — não existe "índice dentro da coluna" nenhum,
  // só onde essa faixa começa e termina no array plano.
  let runningOffset = 0;

  return (
    <div className="space-y-4">
      <div className={`grid gap-4 ${getGridColumnClass(columns)}`}>
        {positionedColumns.map((column, columnIdx) => {
          const columnEndIndex = runningOffset + column.length;
          const el = (
            <ColumnDropZone key={`column-${columnIdx}`} columnEndIndex={columnEndIndex} onMoveUnit={handleMoveUnit}>
              {column.map(({ unit, index }) => (
                <BlockShell
                  key={`${index}-${unit.type}`}
                  unit={unit}
                  index={index}
                  number={numbers[index]}
                  isFirst={index === 0}
                  isLast={index === units.length - 1}
                  canDelete={canDelete}
                  baseKey={baseKey}
                  enharmonicPreference={enharmonicPreference}
                  onChangeType={(type: SongUnitType) =>
                    onChangeUnits(changeUnitType(units, index, type))
                  }
                  onMoveUp={() => onChangeUnits(moveUnitUp(units, index))}
                  onMoveDown={() => onChangeUnits(moveUnitDown(units, index))}
                  onDuplicate={() => onChangeUnits(duplicateUnit(units, index))}
                  onInsertBefore={() => onChangeUnits(insertUnitBefore(units, index))}
                  onInsertAfter={() => onChangeUnits(insertUnitAfter(units, index))}
                  onRemove={() => onChangeUnits(removeUnit(units, index))}
                  onChangeNotes={(notes) => onChangeUnits(setUnitNotes(units, index, notes))}
                  onChangeContent={(content) => onChangeUnits(setUnitContent(units, index, content))}
                  onMoveUnit={handleMoveUnit}
                />
              ))}
            </ColumnDropZone>
          );
          runningOffset = columnEndIndex;
          return el;
        })}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() => onChangeUnits(appendUnit(units))}
        className="flex items-center gap-2"
      >
        <PlusIcon className="w-4 h-4" />
        {t("newUnit")}
      </Button>
    </div>
  );
}

type ColumnDropZoneProps = {
  // Índice (no array plano) logo DEPOIS do último bloco desta coluna — pra
  // coluna vazia, é igual ao índice onde ela começaria. Soltar no espaço
  // vazio da coluna (abaixo do último bloco, ou numa coluna sem bloco
  // nenhum) insere aqui.
  columnEndIndex: number;
  onMoveUnit: (fromIndex: number, toIndex: number) => void;
  children: React.ReactNode;
};

// Alvo de soltar da COLUNA inteira — só age quando o ponto solto não caiu
// em cima de nenhum bloco específico (cada BlockShell já tem seu próprio
// alvo, mais preciso, pela borda mais próxima). dropTargets[0] é sempre o
// alvo mais INTERNO que casou; se for a própria coluna (não um bloco
// dentro dela), é porque soltou no espaço vazio.
function ColumnDropZone({ columnEndIndex, onMoveUnit, children }: ColumnDropZoneProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return dropTargetForElements({
      element: el,
      canDrop: ({ source }) => isSongUnitDragData(source.data),
      getData: () => ({ type: "song-unit-column", columnEndIndex }),
      onDragEnter: ({ location }) => {
        setIsDraggedOver(location.current.dropTargets[0]?.data.type === "song-unit-column");
      },
      onDrag: ({ location }) => {
        setIsDraggedOver(location.current.dropTargets[0]?.data.type === "song-unit-column");
      },
      onDragLeave: () => setIsDraggedOver(false),
      onDrop: ({ source, location }) => {
        setIsDraggedOver(false);
        if (location.current.dropTargets[0]?.data.type !== "song-unit-column") return;
        if (!isSongUnitDragData(source.data)) return;
        const sourceIndex = source.data.index;
        // Mesma conta que getReorderDestinationIndex faz no caso de borda:
        // se a origem já está ANTES deste ponto, a remoção dela desloca o
        // destino uma posição pra trás.
        const destinationIndex = sourceIndex < columnEndIndex ? columnEndIndex - 1 : columnEndIndex;
        onMoveUnit(sourceIndex, destinationIndex);
      },
    });
  }, [columnEndIndex, onMoveUnit]);

  return (
    <div
      ref={ref}
      className={`space-y-2 rounded-lg transition-colors ${
        isDraggedOver ? "bg-zinc-100 outline-2 outline-dashed outline-zinc-300 outline-offset-4" : ""
      }`}
    >
      {children}
      {/* Área mínima pra coluna vazia continuar sendo um alvo de soltar de
          verdade (sem bloco nenhum dentro, a div ficaria com altura zero). */}
      {Array.isArray(children) && children.length === 0 && <div className="min-h-24" />}
    </div>
  );
}

// Classes literais — Tailwind não reconhece `grid-cols-${n}` interpolado
// (mesma solução já usada em ColumnViewer/index.tsx:131-141).
function getGridColumnClass(columns: number) {
  return columns === 2
    ? "grid-cols-2"
    : columns === 3
    ? "grid-cols-3"
    : columns >= 4
    ? "grid-cols-4"
    : "grid-cols-1";
}
