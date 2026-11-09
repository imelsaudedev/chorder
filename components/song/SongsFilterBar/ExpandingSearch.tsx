"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

type ExpandingSearchProps = {
  value: string;
  placeholder: string;
  onSearch: (term: string) => void;
};

/** Lupa que expande ao lado dos seletores (nunca por cima). Tecla "/" abre e foca. */
export default function ExpandingSearch({ value, placeholder, onSearch }: ExpandingSearchProps) {
  const [open, setOpen] = useState(value !== "");
  const inputRef = useRef<HTMLInputElement>(null);
  const debounced = useDebouncedCallback(onSearch, 300);

  useEffect(() => {
    if (value !== "") setOpen(true);
  }, [value]);

  useEffect(() => {
    function onKeyUp(e: KeyboardEvent) {
      if (e.key !== "/" || e.ctrlKey || e.metaKey) return;
      if (/^(?:input|textarea|select|button)$/i.test((e.target as Element)?.tagName)) return;
      e.preventDefault();
      setOpen(true);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
    document.addEventListener("keyup", onKeyUp);
    return () => document.removeEventListener("keyup", onKeyUp);
  }, []);

  if (!open) {
    return (
      <Button
        type="button"
        variant="soft"
        size="icon"
        className="size-8"
        aria-label="Buscar"
        onClick={() => {
          setOpen(true);
          requestAnimationFrame(() => inputRef.current?.focus());
        }}
      >
        <Search />
      </Button>
    );
  }

  return (
    <div className="relative min-w-0 flex-1 sm:max-w-72">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        type="search"
        autoFocus={value === ""}
        defaultValue={value}
        placeholder={placeholder}
        onChange={(e) => debounced(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && e.currentTarget.value === "" && setOpen(false)}
        className="h-8 rounded-md border-0 bg-muted/[.22] pl-8 pr-8 shadow-none [&::-webkit-search-cancel-button]:hidden"
      />
      <button
        type="button"
        aria-label="Fechar busca"
        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        onClick={() => {
          debounced.cancel();
          if (inputRef.current) inputRef.current.value = "";
          onSearch("");
          setOpen(false);
        }}
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
