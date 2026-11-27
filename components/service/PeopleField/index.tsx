"use client";

import { useFetchPeople } from "@/app/api/api-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ServiceLeaderEntry } from "@/lib/service-leaders";
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useId, useState } from "react";

type PeopleFieldProps = {
  value: ServiceLeaderEntry[];
  onChange: (next: ServiceLeaderEntry[]) => void;
  /** Quantas pessoas cabem: 1 vira escolha única (a escolha nova troca a anterior). Sem limite por padrão. */
  max?: number;
  placeholder: string;
  className?: string;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

function useDebounced<T>(value: T, ms: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return debounced;
}

/**
 * Escolha de pessoas do sistema (com foto e nome) ou de um nome livre, para convidado sem conta.
 * A lista de sugestões aparece embaixo do campo, sem portal: dentro de gavetas (vaul) os
 * portais perdem os eventos.
 */
export default function PeopleField({ value, onChange, max, placeholder, className }: PeopleFieldProps) {
  const t = useTranslations("ServiceData");
  const listId = useId();
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);
  const query = useDebounced(text.trim(), 200);
  const { people } = useFetchPeople(query, focused);

  const single = max === 1;
  const full = max !== undefined && !single && value.length >= max;
  const chosenIds = new Set(value.map((v) => v.userId).filter(Boolean));
  const suggestions = people.filter((p) => !chosenIds.has(p.id));
  const typed = text.trim();
  const sameName = (a: string, b: string) => a.localeCompare(b, "pt-BR", { sensitivity: "base" }) === 0;
  const exact = suggestions.find((p) => sameName(p.name, typed));
  const alreadyThere = value.some((v) => sameName(v.name, typed));
  const canAddFree = typed !== "" && !exact && !alreadyThere;

  function add(entry: ServiceLeaderEntry) {
    onChange(single ? [entry] : [...value, entry]);
    setText("");
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault(); // não envia o formulário
      if (exact) add({ userId: exact.id, name: exact.name });
      else if (canAddFree) add({ userId: null, name: typed });
    } else if (e.key === "Backspace" && text === "" && value.length > 0) {
      remove(value.length - 1);
    }
  }

  const showList = focused && !full && (suggestions.length > 0 || canAddFree);

  return (
    <div className={cn("space-y-2", className)}>
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {value.map((person, index) => (
            <li
              key={`${person.userId ?? "nome"}-${person.name}`}
              className="flex items-center gap-2 rounded-full border bg-muted/40 py-1 pl-1 pr-1 text-sm"
            >
              <Avatar className="size-6">
                <AvatarFallback className="text-[10px]">{initials(person.name)}</AvatarFallback>
              </Avatar>
              <span>{person.name}</span>
              <button
                type="button"
                onClick={() => remove(index)}
                aria-label={t("peopleRemove", { name: person.name })}
                className="grid size-7 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {!(single && value.length > 0) && !full && (
        <div className="relative">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 120)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            role="combobox"
            aria-expanded={showList}
            aria-controls={listId}
            aria-autocomplete="list"
            autoComplete="off"
            className="h-11 w-full rounded-md border bg-background px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {showList && (
            <ul
              id={listId}
              role="listbox"
              className="mt-1 max-h-64 overflow-auto rounded-md border bg-popover p-1 shadow-sm"
            >
              {suggestions.map((p) => (
                <li key={p.id} role="option" aria-selected={false}>
                  <button
                    type="button"
                    // mouseDown, não click: o campo perde o foco antes do click e a lista sumiria
                    onMouseDown={(e) => {
                      e.preventDefault();
                      add({ userId: p.id, name: p.name });
                    }}
                    className="flex min-h-11 w-full items-center gap-3 rounded-sm px-2 text-left text-sm hover:bg-muted"
                  >
                    <Avatar className="size-7">
                      {p.image && <AvatarImage src={p.image} alt="" />}
                      <AvatarFallback className="text-[10px]">{initials(p.name)}</AvatarFallback>
                    </Avatar>
                    {p.name}
                  </button>
                </li>
              ))}
              {canAddFree && (
                <li role="option" aria-selected={false}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      add({ userId: null, name: typed });
                    }}
                    className="flex min-h-11 w-full items-center gap-3 rounded-sm px-2 text-left text-sm text-muted-foreground hover:bg-muted"
                  >
                    <Plus className="size-5 shrink-0" />
                    {t("peopleAddWithoutAccount", { name: typed })}
                  </button>
                </li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
