"use client";

import IncreaseDecreaseButtonSet from "@/components/common/IncreaseDecreaseButtonSet";
import Text from "@/components/common/Text";
import KeyButtonSet from "@/components/config/KeyButtonSet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown, Minus, Pause, Play, Plus, SlidersHorizontal, X } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { formatScrollSpeedMultiplier, SCROLL_SPEED_MULTIPLIERS } from "./useAutoScroll";

export const FONT_MIN = 16;
export const FONT_MAX = 40;
const FONT_STEP = 2;

/** Altura da barra superior (h-14) — o início de cada música fica logo abaixo dela. */
export const TOP_BAR_HEIGHT_PX = 56;

type StageModeControlsProps = {
  songTitles: string[];
  currentIndex: number;
  onSelectSong: (index: number) => void;
  originalKey: string;
  transpose: number;
  setTranspose: Dispatch<SetStateAction<number>>;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  isScrollEnabled: boolean;
  scrollSpeedMultiplier: number;
  onTogglePlayback: () => void;
  onSlower: () => void;
  onFaster: () => void;
  onExit: () => void;
};

export default function StageModeControls({
  songTitles,
  currentIndex,
  onSelectSong,
  originalKey,
  transpose,
  setTranspose,
  fontSize,
  onFontSizeChange,
  isScrollEnabled,
  scrollSpeedMultiplier,
  onTogglePlayback,
  onSlower,
  onFaster,
  onExit,
}: StageModeControlsProps) {
  const speedLabel = formatScrollSpeedMultiplier(scrollSpeedMultiplier);

  return (
    <>
      {/* Barra superior — música atual (toque abre a lista do culto pra
          pular direto) + um único ícone de configuração (tom + fonte). */}
      <div className="fixed top-0 inset-x-0 h-14 z-50 flex items-center px-4 sm:px-6 lg:px-8 gap-1 bg-background/90 backdrop-blur-sm border-b border-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              aria-label="Escolher música"
              className="min-w-0 px-2 -ml-2 gap-2 justify-start"
            >
              <span className="shrink-0 text-sm text-muted-foreground tabular-nums">
                {currentIndex + 1}/{songTitles.length}
              </span>
              <Text variant="heading-sm" as="span" className="truncate">
                {songTitles[currentIndex]}
              </Text>
              <ChevronDown size={18} className="shrink-0 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72">
            {songTitles.map((title, index) => (
              <DropdownMenuItem
                key={index}
                onSelect={() => onSelectSong(index)}
                className={`py-3 ${index === currentIndex ? "font-semibold" : ""}`}
              >
                <span className="w-5 text-muted-foreground tabular-nums">{index + 1}</span>
                <span className="truncate">{title}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center shrink-0 ml-auto gap-0.5">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Configurações" className="text-muted-foreground">
                <SlidersHorizontal size={20} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72" align="end">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-zinc-500">Tom</span>
                  <KeyButtonSet originalKey={originalKey} transpose={transpose} setTranspose={setTranspose} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-zinc-500">Tamanho da fonte</span>
                  <IncreaseDecreaseButtonSet
                    stringValue={fontSize.toString()}
                    setStringValue={(value) => {
                      const parsed = parseInt(value, 10);
                      if (Number.isNaN(parsed)) return;
                      onFontSizeChange(Math.min(FONT_MAX, Math.max(FONT_MIN, parsed)));
                    }}
                    increase={() => onFontSizeChange(Math.min(FONT_MAX, fontSize + FONT_STEP))}
                    decrease={() => onFontSizeChange(Math.max(FONT_MIN, fontSize - FONT_STEP))}
                    increaseDisabled={fontSize >= FONT_MAX}
                    decreaseDisabled={fontSize <= FONT_MIN}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Sair do Modo Palco"
            onClick={onExit}
            className="text-muted-foreground"
          >
            <X size={20} />
          </Button>
        </div>
      </div>

      {/* Rolagem — flutuante e centralizada, sem barra de fundo. Parar e
          ajustar são separados: o play sempre liga/para com um toque. */}
      <div
        className="fixed inset-x-0 bottom-4 z-50 flex justify-center pointer-events-none"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="pointer-events-auto flex items-center gap-1 p-1 rounded-full bg-background/90 backdrop-blur-sm border border-border shadow-lg">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Mais devagar"
            onClick={onSlower}
            disabled={scrollSpeedMultiplier <= SCROLL_SPEED_MULTIPLIERS[0]}
            className="rounded-full"
          >
            <Minus size={20} />
          </Button>
          <Button
            variant="default"
            aria-label={isScrollEnabled ? `Pausar rolagem (${speedLabel})` : `Ligar rolagem (${speedLabel})`}
            onClick={onTogglePlayback}
            className={`min-w-24 rounded-full tabular-nums ${
              isScrollEnabled ? "bg-blue-600 text-white hover:bg-blue-600/90" : ""
            }`}
          >
            {isScrollEnabled ? <Pause size={18} /> : <Play size={18} />}
            {speedLabel}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Mais rápido"
            onClick={onFaster}
            disabled={scrollSpeedMultiplier >= SCROLL_SPEED_MULTIPLIERS[SCROLL_SPEED_MULTIPLIERS.length - 1]}
            className="rounded-full"
          >
            <Plus size={20} />
          </Button>
        </div>
      </div>
    </>
  );
}
