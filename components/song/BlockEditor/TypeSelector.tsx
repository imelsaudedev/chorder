"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { unitColorClasses } from "@/components/song/unit-colors";
import { SONG_UNIT_TYPES, SongUnitType } from "@/prisma/models";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

type TypeSelectorProps = {
  value: SongUnitType;
  number: number;
  onChange: (value: SongUnitType) => void;
};

// Seção 8.2: "nome com numeração, igual à da leitura" — o número vem de
// unit-numbering.ts (ordem dos dados), não de column-logic.ts.
export default function TypeSelector({ value, number, onChange }: TypeSelectorProps) {
  const t = useTranslations();
  const colorClasses = unitColorClasses[value];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-sm font-medium shrink-0 bg-white border border-zinc-200 shadow-xs text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
        >
          <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${colorClasses.circleBackground}`} />
          {t(`UnitTypes.${value}`)} {number}
          <ChevronDown size={10} className="text-zinc-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-fit">
        {SONG_UNIT_TYPES.map((type) => {
          const cc = unitColorClasses[type];
          return (
            <DropdownMenuItem
              key={type}
              onClick={() => onChange(type)}
              className="text-xs cursor-pointer gap-2"
            >
              <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${cc.circleBackground}`} />
              {t(`UnitTypes.${type}`)}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
