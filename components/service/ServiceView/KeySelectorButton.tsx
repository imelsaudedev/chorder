"use client";

import KeyButtonSet from "@/components/config/KeyButtonSet";
import { useSongConfig } from "@/components/config/SongConfig";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { transposeChord } from "@/chopro/music";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

type Props = {
  originalKey: string;
};

// Botão único (mobile e desktop) que abre um popover com o seletor de tom —
// mesmo padrão nas duas telas, só a altura muda por breakpoint (igual ao
// botão de referências). O texto visível é só o tom atual; a descrição
// completa ("Tom D") vira aria-label.
export default function KeySelectorButton({ originalKey }: Props) {
  const { transpose, setTranspose } = useSongConfig();
  const t = useTranslations("ServiceView");
  const [open, setOpen] = useState(false);
  const effectiveKey = transposeChord(originalKey, originalKey, transpose);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label={t("keyButtonLabel", { key: effectiveKey })}
          className="h-10 md:h-9 gap-1 px-3"
        >
          <span className="font-semibold">{effectiveKey}</span>
          <ChevronDown size={14} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <KeyButtonSet
          originalKey={originalKey}
          transpose={transpose}
          setTranspose={setTranspose}
          size="sm"
        />
      </PopoverContent>
    </Popover>
  );
}
