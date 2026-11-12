"use client";

import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Check, ChevronDown, X } from "lucide-react";
import { useState } from "react";

type FilterPickerProps = {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  /** Uma escolha só (ex.: ano): escolher fecha o seletor e troca a anterior. */
  single?: boolean;
  /** Texto do botão ✕ (leitores de tela). */
  clearLabel: string;
};

/**
 * Seletor de um filtro do histórico (irmão fino do `CategoryPicker`): fundo suave, o filtro aplicado
 * aparece dentro do botão com ✕, menu nas telas maiores e folha de baixo no celular. Vale ao vivo.
 */
export default function FilterPicker({ label, options, selected, onChange, single, clearLabel }: FilterPickerProps) {
  const [open, setOpen] = useState(false);
  const isMobile = !useMediaQuery("(min-width: 640px)");
  const active = selected.length > 0;

  function toggle(value: string) {
    if (selected.includes(value)) return onChange(selected.filter((v) => v !== value));
    onChange(single ? [value] : [...selected, value]);
    if (single) setOpen(false);
  }

  const text = active ? (selected.length === 1 ? selected[0] : `${label} · ${selected.length}`) : label;

  const list = (
    <div className="flex flex-col">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => toggle(option)}
          className="flex min-h-10 w-full items-center justify-between gap-2 rounded px-3 py-1.5 text-left text-sm transition-colors hover:bg-muted"
        >
          <span className="truncate">{option}</span>
          {selected.includes(option) && <Check className="size-3.5 shrink-0 text-secondary" />}
        </button>
      ))}
    </div>
  );

  const trigger = (
    <Button
      type="button"
      variant="soft"
      size="sm"
      className={active ? "bg-secondary/15 pr-7 text-secondary hover:bg-secondary/20" : undefined}
      aria-haspopup="dialog"
    >
      <span className="max-w-40 truncate">{text}</span>
      {!active && <ChevronDown className="size-3.5" />}
    </Button>
  );

  return (
    <span className="relative inline-flex shrink-0">
      {isMobile ? (
        <>
          <span onClick={() => setOpen(true)} className="inline-flex">
            {trigger}
          </span>
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>{label}</DrawerTitle>
              </DrawerHeader>
              <div className="max-h-[60vh] overflow-y-auto px-2 pb-6">{list}</div>
            </DrawerContent>
          </Drawer>
        </>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>{trigger}</PopoverTrigger>
          <PopoverContent className="max-h-80 w-60 overflow-y-auto p-1" align="start">
            {list}
          </PopoverContent>
        </Popover>
      )}
      {active && (
        <button
          type="button"
          onClick={() => onChange([])}
          aria-label={clearLabel}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-secondary hover:opacity-70"
        >
          <X className="size-3" />
        </button>
      )}
    </span>
  );
}
