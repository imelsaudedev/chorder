"use client";

import { useFetchPeople } from "@/app/api/api-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ServiceLeaderEntry } from "@/lib/service-leaders";
import { cn } from "@/lib/utils";
import { Command } from "cmdk";
import { Plus, UserRound, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

type PeopleFieldProps = {
  value: ServiceLeaderEntry[];
  onChange: (next: ServiceLeaderEntry[]) => void;
  /** 1 = escolha única: a pessoa escolhida fica no campo e "Trocar" a tira. Sem limite por padrão. */
  max?: number;
  placeholder: string;
  className?: string;
  /** Altura do campo: `lg` (44px) como os campos da gaveta (`h-11`); `default` (36px) como o `Input` padrão. */
  size?: "default" | "lg";
  // O FormControl entrega estes três: o rótulo foca o campo e o erro pinta a borda.
  id?: string;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-describedby"?: string;
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

const fold = (text: string) =>
  Array.from(text)
    .map((c) => c.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase())
    .join("");

/** Nome com o trecho digitado em negrito (sem diferenciar maiúsculas nem acentos). */
function Highlight({ name, query }: { name: string; query: string }) {
  const folded = fold(name);
  const at = query && folded.length === name.length ? folded.indexOf(fold(query)) : -1;
  if (at < 0) return <>{name}</>;
  return (
    <>
      {name.slice(0, at)}
      <strong className="font-semibold">{name.slice(at, at + query.length)}</strong>
      {name.slice(at + query.length)}
    </>
  );
}

const sameName = (a: string, b: string) => a.localeCompare(b, "pt-BR", { sensitivity: "base" }) === 0;

/**
 * Escolha de pessoas do sistema (foto e nome) ou de um nome livre, para convidado sem conta.
 * Chips e busca ficam dentro de um campo só. A lista é inline (sem portal: em gaveta do vaul os
 * portais perdem os eventos) e vem do `cmdk`, que cuida de setas, Enter e `aria-activedescendant`.
 * Pessoa com conta tem avatar; nome sem conta tem borda tracejada.
 */
export default function PeopleField({
  value,
  onChange,
  max,
  placeholder,
  className,
  size = "default",
  id,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: PeopleFieldProps) {
  const t = useTranslations("ServiceData");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [armed, setArmed] = useState(false); // Backspace em dois passos: o 1º marca o último chip
  const [announcement, setAnnouncement] = useState("");
  const query = useDebounced(text.trim(), 200);
  const { people, isLoading } = useFetchPeople(query, open);

  // O cmdk fixa o próprio `id` no input e ignora o da prop: aplicamos o do formulário depois de montar,
  // para o clique no rótulo focar o campo. O nome acessível segue vindo do aria-labelledby do cmdk.
  const hasInput = !(max === 1 && value.length > 0) && !(max !== undefined && max !== 1 && value.length >= max);
  useEffect(() => {
    if (id && inputRef.current) inputRef.current.id = id;
  }, [id, hasInput]);

  const single = max === 1;
  const full = max !== undefined && !single && value.length >= max;
  const hasSingleValue = single && value.length > 0;
  const chosenIds = new Set(value.map((v) => v.userId).filter(Boolean));
  const suggestions = people.filter((p) => !chosenIds.has(p.id));
  const recent = suggestions.filter((p) => p.recent);
  const others = suggestions.filter((p) => !p.recent);
  const typed = text.trim();
  const canAddFree =
    typed !== "" && !suggestions.some((p) => sameName(p.name, typed)) && !value.some((v) => sameName(v.name, typed));
  const nothing = suggestions.length === 0 && !canAddFree;

  // Item marcado: controlado, para o primeiro da lista ficar marcado também depois que a busca
  // (que espera a digitação parar) troca as sugestões. Sem isso o Enter não faria nada.
  const shown = typed ? suggestions : [...recent, ...others];
  const firstValue = shown[0] ? `pessoa-${shown[0].id}` : canAddFree ? "adicionar-sem-conta" : "";
  const [active, setActive] = useState("");
  useEffect(() => setActive(firstValue), [firstValue]);

  function add(entry: ServiceLeaderEntry) {
    onChange(single ? [entry] : [...value, entry]);
    setAnnouncement(t("peopleAdded", { name: entry.name }));
    setText("");
    setArmed(false);
    if (single) setOpen(false);
  }

  function remove(index: number) {
    const gone = value[index];
    onChange(value.filter((_, i) => i !== index));
    setAnnouncement(t("peopleRemoved", { name: gone.name }));
    setArmed(false);
    inputRef.current?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
    } else if (text === "" && value.length > 0 && (e.key === "Backspace" || e.key === "ArrowLeft")) {
      if (armed && e.key === "Backspace") {
        e.preventDefault();
        remove(value.length - 1);
      } else if (!armed) {
        e.preventDefault();
        setArmed(true);
      }
    } else if (armed && e.key === "ArrowRight") {
      setArmed(false);
    } else if (armed && e.key.length === 1) {
      setArmed(false);
    }
  }

  return (
    <div
      ref={rootRef}
      className={cn("relative", className)}
      onBlur={(e) => {
        if (!rootRef.current?.contains(e.relatedTarget as Node | null)) {
          setOpen(false);
          setArmed(false);
        }
      }}
    >
      <Command shouldFilter={false} loop label={placeholder} value={active} onValueChange={setActive}>
        <div
          // mesmas bordas, fundo, sombra, foco e erro do `Input` (components/ui/input.tsx)
          aria-invalid={ariaInvalid}
          className={cn(
            "flex w-full min-w-0 flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2 shadow-xs transition-[color,box-shadow] dark:bg-input/30",
            // chip h-8 (32px) + borda: `default` fecha em 36px com 1px de respiro; `lg` em 44px
            size === "lg" ? "min-h-11 py-1" : "min-h-9 py-px",
            "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
            "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
          )}
          onClick={() => inputRef.current?.focus()}
        >
          {value.map((person, index) => {
            const linked = person.userId !== null;
            return (
              <span
                key={`${person.userId ?? "nome"}-${person.name}`}
                title={linked ? undefined : t("peopleNoAccount")}
                className={cn(
                  // altura h-8, a mesma dos chips do sistema (Button soft sm); avatar encostado na borda esquerda
                  "flex h-8 items-center gap-2 overflow-hidden rounded-full border bg-secondary/10 pl-0 pr-1.5 text-sm",
                  linked ? "border-transparent" : "border-dashed border-secondary/40",
                  armed && index === value.length - 1 && "ring-2 ring-ring",
                )}
              >
                <Avatar className="size-[30px]" aria-hidden>
                  <AvatarFallback className="bg-secondary/20 text-xs">
                    {linked ? initials(person.name) : <UserRound className="size-3.5 text-muted-foreground" />}
                  </AvatarFallback>
                </Avatar>
                <span>{person.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(index);
                  }}
                  aria-label={t("peopleRemove", { name: person.name })}
                  // a área de toque vai a 44px sem engordar o chip
                  className="relative grid size-6 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground after:absolute after:-inset-2.5 after:content-['']"
                >
                  <X className="size-4" />
                </button>
              </span>
            );
          })}

          {hasSingleValue ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange([]);
                setOpen(true);
                requestAnimationFrame(() => inputRef.current?.focus());
              }}
              className="ml-auto min-h-8 rounded-md px-2 text-sm text-muted-foreground hover:text-foreground"
            >
              {t("peopleSwitch")}
            </button>
          ) : (
            !full && (
              <Command.Input
                ref={inputRef}
                aria-describedby={ariaDescribedBy}
                value={text}
                onValueChange={(v) => {
                  setText(v);
                  setArmed(false);
                  setOpen(true);
                }}
                onFocus={() => {
                  setOpen(true);
                  // no celular o teclado cobre a lista: traz o campo para a área visível
                  requestAnimationFrame(() => rootRef.current?.scrollIntoView?.({ block: "center", behavior: "smooth" }));
                }}
                onKeyDown={onKeyDown}
                placeholder={value.length === 0 ? placeholder : undefined}
                className="h-8 min-w-24 flex-1 bg-transparent px-1 text-base outline-none placeholder:text-muted-foreground md:text-sm"
              />
            )
          )}
        </div>

        {open && !hasSingleValue && !full && (
          <Command.List
            label={t("peopleList")}
            // mouseDown no item não pode tirar o foco do campo (a lista fecharia antes do clique)
            onMouseDown={(e) => e.preventDefault()}
            className="mt-1 max-h-[min(16rem,40dvh)] overflow-auto rounded-md border bg-popover p-1 shadow-sm"
          >
            {isLoading && suggestions.length === 0 && !canAddFree && (
              <Command.Loading>
                <p className="px-2 py-3 text-sm text-muted-foreground">{t("peopleSearching")}</p>
              </Command.Loading>
            )}
            {!isLoading && nothing && (
              <Command.Empty className="px-2 py-3 text-sm text-muted-foreground">{t("peopleEmpty")}</Command.Empty>
            )}

            {recent.length > 0 && !typed && (
              <Command.Group heading={t("peopleRecent")} className={groupClass}>
                {recent.map((p) => (
                  <PersonRow key={p.id} person={p} query="" onPick={add} />
                ))}
              </Command.Group>
            )}
            {(typed ? suggestions : others).length > 0 && (
              <Command.Group heading={typed ? undefined : t("peopleAll")} className={groupClass}>
                {(typed ? suggestions : others).map((p) => (
                  <PersonRow key={p.id} person={p} query={typed} onPick={add} />
                ))}
              </Command.Group>
            )}
            {canAddFree && (
              <Command.Item
                value="adicionar-sem-conta"
                onSelect={() => add({ userId: null, name: typed })}
                className={cn(itemClass, "text-muted-foreground")}
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-full border border-dashed">
                  <Plus className="size-4" />
                </span>
                {t("peopleAddWithoutAccount", { name: typed })}
              </Command.Item>
            )}
          </Command.List>
        )}
      </Command>
      <p className="sr-only" role="status" aria-live="polite" data-testid="people-announcement">
        {announcement}
      </p>
    </div>
  );
}

const groupClass =
  "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground";

const itemClass =
  "flex min-h-12 cursor-pointer items-center gap-3 rounded-sm px-2 text-sm data-[selected=true]:bg-muted";

function PersonRow({
  person,
  query,
  onPick,
}: {
  person: { id: string; name: string; image: string | null };
  query: string;
  onPick: (entry: ServiceLeaderEntry) => void;
}) {
  return (
    <Command.Item value={`pessoa-${person.id}`} onSelect={() => onPick({ userId: person.id, name: person.name })} className={itemClass}>
      <Avatar className="size-8" aria-hidden>
        {person.image && <AvatarImage src={person.image} alt="" />}
        <AvatarFallback className="text-xs">{initials(person.name)}</AvatarFallback>
      </Avatar>
      <span>
        <Highlight name={person.name} query={query} />
      </span>
    </Command.Item>
  );
}
