"use client";

import KeyButtonSet from "@/components/config/KeyButtonSet";
import { useSongConfig } from "@/components/config/SongConfig";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { transposeChord } from "@/chopro/music";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import ServiceKeyNotice from "./ServiceKeyNotice";

type Props = {
  originalKey: string;
  /** Tom decidido para o culto (semitons). Quando o deste aparelho é outro, avisa e oferece voltar. */
  cultoTranspose?: number;
};

// Botão único (mobile e desktop) que abre um popover com o seletor de tom —
// mesmo padrão nas duas telas, só a altura muda por breakpoint (igual ao
// botão de referências). O texto visível é só o tom atual; a descrição
// completa ("Tom D") vira aria-label.
export default function KeySelectorButton({ originalKey, cultoTranspose }: Props) {
  const { transpose, setTranspose } = useSongConfig();
  const t = useTranslations("ServiceView");
  const [open, setOpen] = useState(false);
  const effectiveKey = transposeChord(originalKey, originalKey, transpose);
  const differsFromService = cultoTranspose !== undefined && cultoTranspose !== transpose;

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
          {differsFromService && (
            // Ponto de destaque: o tom deste aparelho não é o do culto (o motivo está no popover).
            <span
              role="img"
              aria-label={t("keyDiffersFromService", { key: transposeChord(originalKey, originalKey, cultoTranspose) })}
              className="h-1.5 w-1.5 rounded-full bg-accent"
            />
          )}
          <ChevronDown size={14} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex w-auto flex-col gap-2 p-2" align="start">
        <KeyButtonSet
          originalKey={originalKey}
          transpose={transpose}
          setTranspose={setTranspose}
          size="sm"
        />
        {cultoTranspose !== undefined && (
          <ServiceKeyNotice
            originalKey={originalKey}
            transpose={transpose}
            cultoTranspose={cultoTranspose}
            onReset={() => setTranspose(cultoTranspose)}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}
