"use client";

import { Button } from "@/components/ui/button";
import { ClientSongUnit, SongUnitType } from "@/prisma/models";
import { PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import BlockShell from "./BlockShell";
import { distributeUnitsIntoColumns } from "./distributeUnits";
import {
  appendUnit,
  changeUnitType,
  duplicateUnit,
  insertUnitAfter,
  insertUnitBefore,
  moveUnitDown,
  moveUnitUp,
  removeUnit,
  setUnitContent,
  setUnitNotes,
} from "./unitListOperations";
import { computeUnitTypeNumbers } from "../unit-numbering";

type BlockEditorProps = {
  units: ClientSongUnit[];
  columns?: number;
  onChangeUnits: (units: ClientSongUnit[]) => void;
};

// Substituto de SongUnitListForm (Etapa 2 do PLANO.md) — ainda não conectado
// a nenhuma tela real (Etapa 6 faz isso); hoje só Storybook/testes. Colunas
// sempre dinâmicas (D2), recalculadas a cada mudança de conteúdo, reusando
// findBestDistribution sem alterá-lo via distributeUnitsIntoColumns.
export default function BlockEditor({ units, columns = 1, onChangeUnits }: BlockEditorProps) {
  const t = useTranslations("SongForm");
  const numbers = useMemo(() => computeUnitTypeNumbers(units.map((u) => u.type)), [units]);
  const positionedColumns = useMemo(
    () => distributeUnitsIntoColumns(units, columns),
    [units, columns]
  );

  const canDelete = units.length > 1;

  return (
    <div className="space-y-4">
      <div className={`grid gap-4 ${getGridColumnClass(columns)}`}>
        {positionedColumns.map((column, columnIdx) => (
          <div key={`column-${columnIdx}`} className="space-y-2">
            {column.map(({ unit, index }) => (
              <BlockShell
                key={`${index}-${unit.type}`}
                unit={unit}
                number={numbers[index]}
                isFirst={index === 0}
                isLast={index === units.length - 1}
                canDelete={canDelete}
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
              />
            ))}
          </div>
        ))}
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
