"use client";

import StageMode from "@/components/service/StageMode";
import { useServiceConfig } from "@/components/config/ServiceConfig";
import {
  UNIT_CONFIG,
  ServiceUnitTypeValue,
} from "@/components/service/ServicePlanEditor/unitConfig";
import {
  isUnitPending,
  summarizeUnit,
} from "@/components/service/ServicePlanEditor/unitSummary";
import { Button } from "@/components/ui/button";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { ClientService, ClientServiceUnit } from "@/prisma/models";
import { ChevronsLeft, ChevronsRight, Mic2 } from "lucide-react";
import { pushStageModeEntry } from "@/components/service/StageMode/useStageModeHistory";
import { useCallback, useEffect, useRef, useState } from "react";
import ServiceSongUnitView from "./ServiceSongUnitView";

type ServiceViewProps = {
  service: ClientService | null;
};

type SongEntry = {
  /** Posição entre as músicas do culto inteiro (0, 1, 2...). */
  songIndex: number;
  unit: ClientServiceUnit;
};

type SectionBlock = {
  id: string;
  /** Nulo quando o culto não tem plano (lista simples, sem cabeçalho de seção). */
  label: string | null;
  entries: SongEntry[];
};

// Sequência do culto exibida na lista lateral: músicas (clicáveis) e demais
// itens preenchidos (só informativos, para o músico se situar).
type SequenceItem =
  | { kind: "song"; entry: SongEntry }
  | { kind: "info"; unit: ClientServiceUnit };

const SIDEBAR_COLLAPSED_KEY = "liturgia:lista-recolhida";

export default function ServiceView({ service }: ServiceViewProps) {
  const { density, fontSize } = useServiceConfig();
  const [isStageMode, setIsStageMode] = useState(false);
  // Música em que o Modo Palco abre e, ao sair, onde a tela normal volta.
  const [stageIndex, setStageIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  // Elevado acima do modo normal e do Modo Palco: trocar de um pro outro não
  // pode resetar um tom que já foi ajustado na sessão (bug: "tom volta ao
  // original ao entrar no Modo Palco").
  const [transposes, setTransposes] = useState(() =>
    (service?.units ?? [])
      .filter((u): u is ClientServiceUnit => u?.type === "SONG")
      .map((u) => u.semitoneTranspose ?? 0)
  );
  const [collapsed, setCollapsed] = useLocalStorageState(SIDEBAR_COLLAPSED_KEY, false);
  // Indexado pela posição entre as músicas.
  const songRefs = useRef<(HTMLDivElement | null)[]>([]);
  const shouldRestoreScroll = useRef(false);
  // Música escolhida na lista lateral; fica selecionada até a pessoa rolar sozinha.
  const lockedIndex = useRef<number | null>(null);

  const songCount = service?.units?.filter((u) => u?.type === "SONG").length ?? 0;

  useEffect(() => {
    if (isStageMode || !shouldRestoreScroll.current) return;
    shouldRestoreScroll.current = false;
    songRefs.current[stageIndex]?.scrollIntoView({ block: "start" });
  }, [isStageMode, stageIndex]);

  // Destaca na lista a música que está na altura do topo da tela. Duas exceções:
  // no fim da página a última música é a atual (ela nunca chega ao topo, pois
  // não há mais conteúdo abaixo), e depois de clicar numa música da lista ela
  // fica selecionada até a pessoa voltar a rolar por conta própria.
  useEffect(() => {
    if (isStageMode || songCount === 0) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      if (lockedIndex.current !== null) {
        setCurrentIndex(lockedIndex.current);
        return;
      }
      const els = songRefs.current;
      const root = document.documentElement;
      const canScroll = root.scrollHeight > window.innerHeight + 4;
      const atBottom = canScroll && window.scrollY + window.innerHeight >= root.scrollHeight - 4;
      if (atBottom) {
        setCurrentIndex(Math.max(0, els.filter(Boolean).length - 1));
        return;
      }
      const line = window.innerHeight * 0.3;
      let active = 0;
      els.forEach((el, index) => {
        if (el && el.getBoundingClientRect().top <= line) active = index;
      });
      setCurrentIndex(active);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    // Rolagem feita pela pessoa (roda do mouse, toque, teclado) libera a seleção travada.
    const releaseLock = () => {
      lockedIndex.current = null;
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("wheel", releaseLock, { passive: true });
    window.addEventListener("touchstart", releaseLock, { passive: true });
    window.addEventListener("keydown", releaseLock);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("wheel", releaseLock);
      window.removeEventListener("touchstart", releaseLock);
      window.removeEventListener("keydown", releaseLock);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [isStageMode, songCount]);

  const scrollToSong = useCallback((index: number) => {
    lockedIndex.current = index;
    setCurrentIndex(index);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    songRefs.current[index]?.scrollIntoView({
      block: "start",
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, []);

  if (!service) return null;
  if (!service.units) throw new Error("Service units are not available");

  const songUnits = service.units.filter((u): u is ClientServiceUnit => u?.type === "SONG");
  const gapClass = density === "compact" ? "gap-4" : "gap-10";

  // Agrupa as músicas pelas seções do culto. As músicas do plano casam com
  // songUnits pela posição (ambas seguem a mesma ordem), pois o JSON do plano
  // pode ter arrangementIds desatualizados/nulos após o primeiro save. Músicas
  // ainda sem arranjo não entram (nem avançam a posição) e seções sem música
  // não aparecem. Os demais itens preenchidos só entram na sequência lateral.
  const blocks: SectionBlock[] = [];
  const sequence: SequenceItem[] = [];
  const sections = service.plan?.sections ?? [];
  if (sections.length === 0) {
    const entries = songUnits.map((unit, songIndex) => ({ songIndex, unit }));
    blocks.push({ id: "all", label: null, entries });
    entries.forEach((entry) => sequence.push({ kind: "song", entry }));
  } else {
    let songCursor = 0;
    sections.forEach((section) => {
      const entries: SongEntry[] = [];
      const sectionSequence: SequenceItem[] = [];
      (section.units ?? []).forEach((planUnit) => {
        if (planUnit.type === "SONG") {
          if (!planUnit.arrangement?.song) return;
          const flat = songUnits[songCursor];
          if (!flat) return;
          const entry = { songIndex: songCursor, unit: flat };
          entries.push(entry);
          sectionSequence.push({ kind: "song", entry });
          songCursor += 1;
        } else if (!isUnitPending(planUnit)) {
          sectionSequence.push({ kind: "info", unit: planUnit });
        }
      });
      if (entries.length > 0) {
        blocks.push({ id: section.id, label: section.label, entries });
        sequence.push(...sectionSequence);
      }
    });
  }
  const hasSongs = blocks.some((block) => block.entries.length > 0);

  function enterStageMode() {
    // Primeira música cujo fim ainda está na tela.
    const visibleIndex = songRefs.current.findIndex((el) => el && el.getBoundingClientRect().bottom > 0);
    setStageIndex(Math.max(0, visibleIndex));
    pushStageModeEntry();
    setIsStageMode(true);
  }

  if (isStageMode) {
    return (
      <StageMode
        units={songUnits}
        initialIndex={stageIndex}
        initialFontSize={fontSize}
        initialTransposes={transposes}
        onExit={(index, exitTransposes) => {
          setStageIndex(index);
          setTransposes(exitTransposes);
          shouldRestoreScroll.current = true;
          setIsStageMode(false);
        }}
      />
    );
  }

  if (!hasSongs) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Nenhuma música definida para este culto ainda.
      </p>
    );
  }

  return (
    <>
      <div className="lg:flex lg:items-start lg:gap-8">
        <SongSidebar
          sequence={sequence}
          currentIndex={currentIndex}
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((v) => !v)}
          onSelect={scrollToSong}
        />

        <div
          className="flex min-w-0 w-full flex-1 flex-col gap-14"
          style={{ fontSize: `${fontSize}px` }}
        >
          {blocks.map((block) => (
            <section key={block.id}>
              {block.label !== null && (
                <h2 className="mb-4 flex min-h-8 items-center border-b border-border text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {block.label || "Seção"}
                </h2>
              )}
              <div className={`flex flex-col ${gapClass}`}>
                {block.entries.map((entry) => (
                  <div
                    key={entry.songIndex}
                    ref={(el) => {
                      songRefs.current[entry.songIndex] = el;
                    }}
                  >
                    <ServiceSongUnitView
                      unit={entry.unit}
                      transpose={transposes[entry.songIndex] ?? 0}
                      onTransposeChange={(value) =>
                        setTransposes((prev) =>
                          prev.map((v, i) => (i === entry.songIndex ? value : v))
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50">
        <Button
          variant="secondary"
          aria-label="Entrar no Modo Palco"
          onClick={enterStageMode}
          className="shadow-md rounded-full gap-1.5"
        >
          <Mic2 size={18} />
          Palco
        </Button>
      </div>
    </>
  );
}

// Mini versão da lista do culto (ícones sobre uma linha vertical, como na aba
// Liturgia), para navegar entre as músicas (tablet horizontal e desktop). As
// músicas são clicáveis e coloridas; os demais itens são só informativos, em
// cinza. No celular não existe: a página apenas rola.
function SongSidebar({
  sequence,
  currentIndex,
  collapsed,
  onToggleCollapsed,
  onSelect,
}: {
  sequence: SequenceItem[];
  currentIndex: number;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onSelect: (index: number) => void;
}) {
  const songConfig = UNIT_CONFIG.SONG;
  const SongIcon = songConfig.icon;

  return (
    <nav
      aria-label="Roteiro do culto"
      className={`stage-mode-hidden sticky top-4 hidden max-h-[calc(100dvh-2rem)] shrink-0 flex-col overflow-y-auto lg:flex ${
        collapsed ? "w-12" : "w-64"
      }`}
    >
      {/* Cabeçalho na mesma altura e estilo do cabeçalho de seção da página */}
      <div className="mb-4 flex min-h-8 items-center justify-between border-b border-border">
        {!collapsed && (
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Roteiro
          </span>
        )}
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expandir roteiro" : "Recolher roteiro"}
          className={`cursor-pointer -my-1.5 flex size-11 items-center justify-center rounded-md text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 ${
            collapsed ? "mx-auto" : ""
          }`}
        >
          {collapsed ? <ChevronsRight className="w-5 h-5" /> : <ChevronsLeft className="w-5 h-5" />}
        </button>
      </div>

      <ul className="flex flex-col">
        {sequence.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === sequence.length - 1;

          if (item.kind === "info") {
            const config = UNIT_CONFIG[item.unit.type as ServiceUnitTypeValue];
            const Icon = config?.icon;
            const summary = summarizeUnit(item.unit, config?.label ?? item.unit.type);
            // Quem faz (fala, oração, sermão) não aparece no roteiro.
            const showSubtitle = !["FALA", "ORACAO", "SERMAO"].includes(item.unit.type);
            const text = `${summary.title ?? ""}${showSubtitle && summary.subtitle ? ` · ${summary.subtitle}` : ""}`;
            return (
              <li
                key={`info-${index}`}
                title={collapsed ? text : undefined}
                className="flex min-h-9 items-stretch gap-2 text-sm text-muted-foreground"
              >
                <Rail isFirst={isFirst} isLast={isLast} className="text-muted-foreground">
                  {Icon && <Icon className="w-5 h-5" />}
                </Rail>
                <span className={collapsed ? "sr-only" : "min-w-0 self-center truncate"}>{text}</span>
              </li>
            );
          }

          const { entry } = item;
          const title = entry.unit.arrangement?.song?.title ?? "";
          const isCurrent = entry.songIndex === currentIndex;
          return (
            <li key={`song-${entry.songIndex}`}>
              <button
                type="button"
                onClick={() => onSelect(entry.songIndex)}
                aria-current={isCurrent ? "true" : undefined}
                aria-label={`${entry.songIndex + 1}. ${title}`}
                title={collapsed ? title : undefined}
                className="cursor-pointer flex min-h-11 w-full items-stretch gap-2 rounded-md text-left hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-[current=true]:bg-muted/20"
              >
                <Rail isFirst={isFirst} isLast={isLast} className={songConfig.color}>
                  <SongIcon className="w-5 h-5" />
                </Rail>
                {/* Número colado ao título (no recolhido, só o número ao lado do ícone) */}
                <span className="flex min-w-0 flex-1 items-center gap-1 self-center pr-2">
                  <span
                    className={`shrink-0 tabular-nums ${
                      collapsed ? "text-xs" : "text-sm"
                    } ${isCurrent ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                  >
                    {entry.songIndex + 1}
                    {!collapsed && "."}
                  </span>
                  {!collapsed && (
                    <span className={`min-w-0 truncate text-sm ${isCurrent ? "font-semibold" : ""}`}>
                      {title}
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// Coluna do ícone com o fio vertical que liga um item ao seguinte. O fio é
// desenhado em dois trechos (acima e abaixo do ícone), então não precisa de
// fundo para "esconder" a linha atrás do ícone.
function Rail({
  isFirst,
  isLast,
  className,
  children,
}: {
  isFirst: boolean;
  isLast: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span aria-hidden="true" className="flex w-6 shrink-0 flex-col items-center self-stretch">
      <span className={`w-px flex-1 ${isFirst ? "" : "bg-muted-foreground/30"}`} />
      <span className={`py-0.5 ${className ?? ""}`}>{children}</span>
      <span className={`w-px flex-1 ${isLast ? "" : "bg-muted-foreground/30"}`} />
    </span>
  );
}
