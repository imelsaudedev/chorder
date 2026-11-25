"use client";

import KeyButtonSet from "@/components/config/KeyButtonSet";
import { useSongConfig } from "@/components/config/SongConfig";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { transposeChord } from "@/chopro/music";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { currentRoot, formatKey, isSameShift } from "../KeyButtonSet/key-utils";
import ServiceKeyNotice from "./ServiceKeyNotice";

type Props = {
  originalKey: string;
  /** Tom decidido para o culto (semitons). Quando o deste aparelho é outro, avisa e oferece voltar. */
  cultoTranspose?: number;
  /** No desktop, de que lado do botão o popover alinha: "end" quando o botão fica à direita da tela (tela do culto), "start" quando fica à esquerda. No celular é sempre "start". */
  desktopAlign?: "start" | "end";
};

// Botão único (mobile e desktop) que abre um popover com o seletor de tom —
// mesmo padrão nas duas telas, só a altura muda por breakpoint (igual ao
// botão de referências). O texto visível é só o tom atual; a descrição
// completa ("Tom D") vira aria-label.
export default function KeySelectorButton({ originalKey, cultoTranspose, desktopAlign = "end" }: Props) {
  const { transpose, setTranspose, enharmonicPreference } = useSongConfig();
  const t = useTranslations("ServiceView");
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  // Mesma grafia do seletor (A♯ ou B♭, conforme a escolha), e não a padrão da transposição.
  const effectiveRoot = currentRoot(originalKey, transpose, enharmonicPreference ?? null);
  const effectiveKey = effectiveRoot ? formatKey(effectiveRoot) : transposeChord(originalKey, originalKey, transpose);
  const cultoRoot = cultoTranspose === undefined ? null : currentRoot(originalKey, cultoTranspose, null);
  const differsFromService = cultoTranspose !== undefined && !isSameShift(cultoTranspose, transpose);

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
              aria-label={t("keyDiffersFromService", { key: cultoRoot ? formatKey(cultoRoot) : transposeChord(originalKey, originalKey, cultoTranspose) })}
              className="h-1.5 w-1.5 rounded-full bg-accent"
            />
          )}
          <ChevronDown size={14} />
        </Button>
      </PopoverTrigger>
      {/* Desktop: alinhado pelo lado de `desktopAlign`. Celular: sai da borda esquerda do botão e fica sempre dentro da tela (collisionPadding). */}
      <PopoverContent
        className="flex w-auto max-w-[calc(100vw-1rem)] flex-col gap-2 p-2"
        align={isDesktop ? desktopAlign : "start"}
        collisionPadding={8}
      >
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
