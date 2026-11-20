"use client";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { jumpToLetter } from "@/lib/songs-list-sticky";
import { Letters } from "lucide-react";
import { useState } from "react";

const ALPHABET = Array.from("abcdefghijklmnopqrstuvwxyz");

/** Grade de letras (só na ordem por título). Letras sem música ficam apagadas. */
export default function LettersGrid() {
  const [open, setOpen] = useState(false);
  // As faixas de letra da lista têm id = letra; o que não existir no DOM fica apagado.
  const present = (l: string) => typeof document !== "undefined" && !!document.getElementById(l);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="soft" size="icon" className="size-8 max-sm:hidden" aria-label="Ir para a letra">
          <Letters />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-56 p-2"
        // Ao fechar, o Radix devolveria o foco ao botão e rolaria a página de volta.
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="grid grid-cols-6 gap-1">
          {ALPHABET.map((l) =>
            present(l) ? (
              <a
                key={l}
                href={`#${l}`}
                onClick={(e) => {
                  e.preventDefault();
                  setOpen(false);
                  // Espera o popover soltar a trava de rolagem antes de rolar.
                  setTimeout(() => jumpToLetter(l), 50);
                }}
                className="flex size-8 items-center justify-center rounded text-sm font-semibold uppercase text-secondary hover:bg-muted"
              >
                {l}
              </a>
            ) : (
              <span
                key={l}
                className="flex size-8 items-center justify-center text-sm font-semibold uppercase text-muted-foreground/30"
              >
                {l}
              </span>
            )
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
