"use client";

import IncreaseDecreaseButtonSet from "@/components/common/IncreaseDecreaseButtonSet";
import Text from "@/components/common/Text";
import ColumnButtons from "@/components/config/ColumnButtons";
import KeyButtonSet from "@/components/config/KeyButtonSet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  ChevronLeft,
  ChevronRight,
  Columns3,
  Minimize,
  Minus,
  MoveVertical,
  Play,
  Plus,
  Rows2,
  Rows3,
  SlidersHorizontal,
} from "lucide-react";
import { Dispatch, ReactNode, SetStateAction } from "react";
import { OVERVIEW_FONT_MIN, OverviewFit, OverviewSettings } from "./StageOverview";
import { formatScrollSpeedMultiplier, SCROLL_SPEED_MULTIPLIERS } from "./useAutoScroll";

export const FONT_MIN = 16;
export const FONT_MAX = 40;
const FONT_STEP = 2;

/**
 * Altura de reserva da barra superior no celular (py-3.5 + título 24px + mapa 28px) —
 * o valor de verdade é medido (ResizeObserver) em StageMode, porque no tablet/desktop a barra é
 * uma linha só e fica mais baixa.
 */
export const TOP_BAR_HEIGHT_PX = 80;
export const TOP_BAR_ID = "stage-top-bar";
/** Reserva do rodapé (h-10 + paddings); também medido em StageMode. */
export const FOOTER_HEIGHT_PX = 57;
export const FOOTER_ID = "stage-footer";

export type StageLayoutMode = "scroll" | "overview";

/** Só existe na visão geral. */
export type StageOverviewControls = {
  /** Tela de música (os ajustes valem pra música); em tela de itens do roteiro ficam desabilitados. */
  editable: boolean;
  settings: OverviewSettings;
  fit: OverviewFit | null;
  onChange: (patch: Partial<OverviewSettings>) => void;
  /** "3/9" — posição da tela entre as telas. */
  position: string;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
};

type StageModeControlsProps = {
  /** "3/5" — posição da música; nulo quando um item do roteiro está na tela. */
  indexLabel: string | null;
  /** Título da música atual, ou "Tipo · rótulo" do item do roteiro na tela. */
  title: string;
  /** Segunda linha do cabeçalho (celular) / direita (tablet): mapa da música ou responsável · duração do item. */
  map: ReactNode;
  layoutMode: StageLayoutMode;
  onLayoutModeChange: (mode: StageLayoutMode) => void;
  overview?: StageOverviewControls;
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

// Botões do rodapé: o Button do sistema (variantes e cantos padrão), todos no
// mesmo tamanho "lg" (h-10); os de ícone só fixam a largura.
const ICON_BUTTON = "w-10 px-0";

const DENSITY_LABELS: Record<string, string> = { normal: "normal", compact: "compacta" };

export default function StageModeControls({
  indexLabel,
  title,
  map,
  layoutMode,
  onLayoutModeChange,
  overview,
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
          a rolagem calcula posições a partir dela. Celular e tablet: título e, embaixo,
          o mapa numa linha. Desktop (xl): título à esquerda, mapa à direita, numa linha só. */}
      <div
        id={TOP_BAR_ID}
        className="fixed top-0 inset-x-0 z-50 px-4 sm:px-6 lg:px-8 py-3.5 xl:py-2.5 bg-background/90 backdrop-blur-sm border-b border-border xl:flex xl:items-center xl:gap-2"
      >
        <div className="flex h-6 min-w-0 items-center gap-2 xl:max-w-[45%]">
          {indexLabel && (
            <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{indexLabel}</span>
          )}
          {/* Mesmo título do cabeçalho da liturgia quando preso: heading-lg, só com o corpo menor. */}
          <Text variant="heading-lg" as="span" size="base" className="truncate">
            {title}
          </Text>
        </div>
        <div className="flex h-7 items-center xl:h-8 xl:min-w-0 xl:flex-1 xl:justify-end">{map}</div>
      </div>

      {/* Rodapé (zona do polegar) — à esquerda a rolagem (− ▶ +) ou, na visão geral,
          a troca de tela (◀ n/N ▶); à direita configurações e sair do Modo Palco.
          O play usa a cor primária do sistema quando parado e azul, só com a
          velocidade, quando está rolando. */}
      <div
        id={FOOTER_ID}
        className="fixed bottom-0 inset-x-0 z-50 flex items-center gap-2 px-4 sm:px-6 lg:px-8 pt-2 bg-background/90 backdrop-blur-sm border-t border-border"
        style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
      >
        {overview ? (
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="lg"
              aria-label="Tela anterior"
              onClick={overview.onPrev}
              disabled={!overview.canPrev}
              className={ICON_BUTTON}
            >
              <ChevronLeft />
            </Button>
            <div className="flex h-10 w-[72px] items-center justify-center text-sm tabular-nums text-muted-foreground">
              {overview.position}
            </div>
            <Button
              variant="outline"
              size="lg"
              aria-label="Próxima tela"
              onClick={overview.onNext}
              disabled={!overview.canNext}
              className={ICON_BUTTON}
            >
              <ChevronRight />
            </Button>
          </div>
        ) : (
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="lg"
              aria-label="Mais devagar"
              onClick={onSlower}
              disabled={scrollSpeedMultiplier <= SCROLL_SPEED_MULTIPLIERS[0]}
              className={ICON_BUTTON}
            >
              <Minus />
            </Button>
            <Button
              // Parado: cor primária do sistema; rolando: o azul de base do sistema (secondary).
              variant={isScrollEnabled ? "secondary" : "default"}
              size="lg"
              aria-label={isScrollEnabled ? `Pausar rolagem (${speedLabel})` : `Ligar rolagem (${speedLabel})`}
              onClick={onTogglePlayback}
              className="w-[72px] px-0 tabular-nums"
            >
              {isScrollEnabled ? speedLabel : <Play />}
            </Button>
            <Button
              variant="outline"
              size="lg"
              aria-label="Mais rápido"
              onClick={onFaster}
              disabled={scrollSpeedMultiplier >= SCROLL_SPEED_MULTIPLIERS[SCROLL_SPEED_MULTIPLIERS.length - 1]}
              className={ICON_BUTTON}
            >
              <Plus />
            </Button>
          </div>
        )}

        <div className="ml-auto flex gap-2">
          {/* Layout do Palco, fora do popover (trocar é frequente): rolagem contínua
              ou visão geral (música inteira numa tela). Sempre um dos dois ligado. */}
          {/* Botões do sistema (cantos arredondados e leve sombra), um por layout; o ativo em cor primária. */}
          <div role="radiogroup" aria-label="Layout" className="flex gap-1">
            <Button
              role="radio"
              aria-checked={layoutMode === "scroll"}
              variant={layoutMode === "scroll" ? "default" : "outline"}
              size="lg"
              aria-label="Rolagem"
              title="Rolagem"
              onClick={() => onLayoutModeChange("scroll")}
              className={ICON_BUTTON}
            >
              <MoveVertical />
            </Button>
            <Button
              role="radio"
              aria-checked={layoutMode === "overview"}
              variant={layoutMode === "overview" ? "default" : "outline"}
              size="lg"
              aria-label="Visão geral"
              title="Visão geral"
              onClick={() => onLayoutModeChange("overview")}
              className={ICON_BUTTON}
            >
              <Columns3 />
            </Button>
          </div>

          {/* Mesmo padrão do ServiceConfig (tela do culto): Popover, título em
              text-primary e grupos de rótulo text-xs text-muted-foreground. */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="lg" aria-label="Configurações" className={ICON_BUTTON}>
                <SlidersHorizontal />
              </Button>
            </PopoverTrigger>
            <PopoverContent side="top" align="end" className="max-h-[70vh] w-72 overflow-y-auto">
              <div className="flex flex-col gap-4">
                <p className="text-sm font-semibold text-primary">Configurações</p>

                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="stage-show-roteiro" className="text-xs font-normal text-muted-foreground">
                    Exibir roteiro
                  </Label>
                  <Switch id="stage-show-roteiro" checked={showRoteiro} onCheckedChange={onShowRoteiroChange} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-muted-foreground">Tom</span>
                  <KeyButtonSet originalKey={originalKey} transpose={transpose} setTranspose={setTranspose} />
                </div>

                {overview ? (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs text-muted-foreground">Colunas</span>
                      <ColumnButtons
                        id="stage-overview-columns"
                        columns={overview.settings.columns}
                        setColumns={(value) =>
                          overview.onChange({
                            columns: typeof value === "function" ? value(overview.settings.columns) : value,
                          })
                        }
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs text-muted-foreground">Tamanho da fonte</span>
                      <div className="flex items-center gap-2">
                        <IncreaseDecreaseButtonSet
                          stringValue={(overview.settings.fontSize || overview.fit?.fontSize || OVERVIEW_FONT_MIN).toString()}
                          setStringValue={(value) => {
                            const parsed = parseInt(value, 10);
                            if (Number.isNaN(parsed)) return;
                            overview.onChange({ fontSize: Math.min(FONT_MAX, Math.max(OVERVIEW_FONT_MIN, parsed)) });
                          }}
                          increase={() => {
                            const base = overview.settings.fontSize || overview.fit?.fontSize || OVERVIEW_FONT_MIN;
                            overview.onChange({ fontSize: Math.min(FONT_MAX, base + 1) });
                          }}
                          decrease={() => {
                            const base = overview.settings.fontSize || overview.fit?.fontSize || OVERVIEW_FONT_MIN;
                            overview.onChange({ fontSize: Math.max(OVERVIEW_FONT_MIN, base - 1) });
                          }}
                          increaseDisabled={!overview.editable}
                          decreaseDisabled={!overview.editable}
                        />
                        <Button
                          variant={overview.settings.fontSize === 0 ? "default" : "outline"}
                          size="sm"
                          disabled={!overview.editable}
                          onClick={() => overview.onChange({ fontSize: 0 })}
                        >
                          Auto
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs text-muted-foreground">Densidade</span>
                      <ToggleGroup
                        type="single"
                        variant="outline"
                        value={overview.settings.density}
                        onValueChange={(value) => {
                          if (value) overview.onChange({ density: value as OverviewSettings["density"] });
                        }}
                      >
                        <ToggleGroupItem value="auto" aria-label="Automática" className="px-4" disabled={!overview.editable}>
                          AUTO
                        </ToggleGroupItem>
                        <ToggleGroupItem value="normal" aria-label="Normal" disabled={!overview.editable}>
                          <Rows2 />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="compact" aria-label="Compacta" disabled={!overview.editable}>
                          <Rows3 />
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </div>

                    {overview.fit && (
                      <p className="text-xs text-muted-foreground">
                        {overview.fit.overflow
                          ? "Não coube na tela: a música rola. Reduza a fonte ou aumente as colunas."
                          : `Agora: ${overview.fit.columns} ${overview.fit.columns === 1 ? "coluna" : "colunas"} · ${
                              overview.fit.fontSize
                            }px · ${DENSITY_LABELS[overview.fit.density]}`}
                      </p>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={!overview.editable}
                      onClick={() => overview.onChange({ columns: 0, fontSize: 0, density: "auto" })}
                    >
                      Redefinir para automático
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-muted-foreground">Tamanho da fonte</span>
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
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Ícone "sair da tela cheia" (cantos para dentro) — sai do Modo Palco. */}
          <Button
            variant="outline"
            size="lg"
            aria-label="Sair do Modo Palco"
            title="Sair do Modo Palco"
            onClick={onExit}
            className={ICON_BUTTON}
          >
            <Minimize />
          </Button>
        </div>
      </div>
    </>
  );
}
