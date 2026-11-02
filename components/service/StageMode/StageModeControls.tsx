"use client";

import IncreaseDecreaseButtonSet from "@/components/common/IncreaseDecreaseButtonSet";
import KeyButtonSet from "@/components/config/KeyButtonSet";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Minimize, Minus, Play, Plus, SlidersHorizontal } from "lucide-react";
import { Dispatch, ReactNode, SetStateAction } from "react";
import { formatScrollSpeedMultiplier, SCROLL_SPEED_MULTIPLIERS } from "./useAutoScroll";

export const FONT_MIN = 16;
export const FONT_MAX = 40;
const FONT_STEP = 2;

/**
 * Altura de reserva da barra superior no celular (py-3.5 + título 30px + mapa 28px + espaço) —
 * o valor de verdade é medido (ResizeObserver) em StageMode, porque no tablet/desktop a barra é
 * uma linha só e fica mais baixa.
 */
export const TOP_BAR_HEIGHT_PX = 90;
export const TOP_BAR_ID = "stage-top-bar";

type StageModeControlsProps = {
  /** "3/5" — posição da música; nulo quando um item do roteiro está na tela. */
  indexLabel: string | null;
  /** Título da música atual, ou "Tipo · rótulo" do item do roteiro na tela. */
  title: string;
  /** Segunda linha do cabeçalho (celular) / direita (tablet): mapa da música ou responsável · duração do item. */
  map: ReactNode;
  originalKey: string;
  transpose: number;
  setTranspose: Dispatch<SetStateAction<number>>;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  showRoteiro: boolean;
  onShowRoteiroChange: (show: boolean) => void;
  isScrollEnabled: boolean;
  scrollSpeedMultiplier: number;
  onTogglePlayback: () => void;
  onSlower: () => void;
  onFaster: () => void;
  onExit: () => void;
};

// Todos os botões do rodapé: mesma altura (48px) e formato (retângulo arredondado).
const FOOTER_BUTTON = "h-12 min-w-11 rounded-xl p-0";

export default function StageModeControls({
  indexLabel,
  title,
  map,
  originalKey,
  transpose,
  setTranspose,
  fontSize,
  onFontSizeChange,
  showRoteiro,
  onShowRoteiroChange,
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
      {/* Cabeçalho — só informação (sem botões, menos toque acidental). Altura fixa:
          a rolagem calcula posições a partir dela. Celular: título e, embaixo, o mapa
          numa linha. Tablet/desktop: título à esquerda, mapa à direita. */}
      <div
        id={TOP_BAR_ID}
        className="fixed top-0 inset-x-0 z-50 px-4 sm:px-6 lg:px-8 py-3.5 lg:py-2.5 bg-background/90 backdrop-blur-sm border-b border-border lg:flex lg:items-center lg:gap-2"
      >
        <div className="flex h-[30px] min-w-0 items-center gap-2 lg:max-w-[45%]">
          {indexLabel && (
            <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{indexLabel}</span>
          )}
          <span className="truncate text-[15px] font-semibold">{title}</span>
        </div>
        <div className="mt-1 flex h-7 items-center lg:mt-0 lg:min-w-0 lg:flex-1 lg:justify-end">{map}</div>
      </div>

      {/* Rodapé (zona do polegar) — à esquerda a rolagem (− ▶ +), à direita
          configurações e sair do Modo Palco. O play fica preto quando parado e
          azul, só com a velocidade, quando está rolando. */}
      <div
        className="fixed bottom-0 inset-x-0 z-50 flex items-center gap-2 px-3 pt-2 bg-background/90 backdrop-blur-sm border-t border-border"
        style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
      >
        <div className="flex gap-1">
          <Button
            variant="outline"
            aria-label="Mais devagar"
            onClick={onSlower}
            disabled={scrollSpeedMultiplier <= SCROLL_SPEED_MULTIPLIERS[0]}
            className={FOOTER_BUTTON}
          >
            <Minus className="size-5" />
          </Button>
          <Button
            aria-label={isScrollEnabled ? `Pausar rolagem (${speedLabel})` : `Ligar rolagem (${speedLabel})`}
            onClick={onTogglePlayback}
            className={`${FOOTER_BUTTON} w-[88px] tabular-nums text-[17px] ${
              isScrollEnabled
                ? "bg-blue-600 text-white hover:bg-blue-600/90"
                : "bg-foreground text-background hover:bg-foreground/90"
            }`}
          >
            {isScrollEnabled ? speedLabel : <Play className="size-5" />}
          </Button>
          <Button
            variant="outline"
            aria-label="Mais rápido"
            onClick={onFaster}
            disabled={scrollSpeedMultiplier >= SCROLL_SPEED_MULTIPLIERS[SCROLL_SPEED_MULTIPLIERS.length - 1]}
            className={FOOTER_BUTTON}
          >
            <Plus className="size-5" />
          </Button>
        </div>

        <div className="ml-auto flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" aria-label="Configurações" className={`${FOOTER_BUTTON} w-12`}>
                <SlidersHorizontal className="size-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xs">
              <DialogHeader>
                <DialogTitle>Configurações</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="stage-show-roteiro" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Exibir roteiro
                  </label>
                  <Switch
                    id="stage-show-roteiro"
                    checked={showRoteiro}
                    onCheckedChange={onShowRoteiroChange}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tom</span>
                  <KeyButtonSet originalKey={originalKey} transpose={transpose} setTranspose={setTranspose} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fonte</span>
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
            </DialogContent>
          </Dialog>

          {/* Ícone "sair da tela cheia" (cantos para dentro) — sai do Modo Palco. */}
          <Button
            variant="outline"
            aria-label="Sair do Modo Palco"
            title="Sair do Modo Palco"
            onClick={onExit}
            className={`${FOOTER_BUTTON} w-12`}
          >
            <Minimize className="size-5" />
          </Button>
        </div>
      </div>
    </>
  );
}
