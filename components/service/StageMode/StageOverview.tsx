"use client";

import ColumnViewer from "@/components/song/ArrangementView/ColumnViewer";
import { ClientArrangement, ClientServiceUnit } from "@/prisma/models";
import { useLayoutEffect, useRef, useState } from "react";
import StageRoteiroItem from "./StageRoteiroItem";

export type OverviewDensity = "normal" | "compact";

/** Ajustes da visão geral de UMA música. 0 / "auto" = o layout automático decide. */
export type OverviewSettings = {
  columns: number;
  fontSize: number;
  density: "auto" | OverviewDensity;
};
export const DEFAULT_OVERVIEW_SETTINGS: OverviewSettings = { columns: 0, fontSize: 0, density: "auto" };

/** O que o layout automático (ou os ajustes manuais) resultou. `overflow`: nem a fonte mínima coube — a tela rola. */
export type OverviewFit = {
  columns: number;
  fontSize: number;
  density: OverviewDensity;
  overflow: boolean;
};

/** Piso de legibilidade da fonte no encaixe automático — calibrar no aparelho. */
export const OVERVIEW_FONT_MIN = 11;
const FONT_MAX_AUTO = 36;
/** Largura mínima de uma coluna: define quantas colunas cabem (celular 1, tablet vertical 2, horizontal 3, desktop largo 4). */
const MIN_COLUMN_WIDTH = 300;
/** Deslize vertical mínimo (px) pra trocar de tela. */
const SWIPE_MIN_PX = 60;

type Candidate = { columns: number; density: OverviewDensity };
type Best = Candidate & { fontSize: number };

type StageOverviewProps = {
  /** Muda a cada tela — reinicia o encaixe. */
  screenKey: string;
  /** Tela de música. */
  arrangement?: ClientArrangement | null;
  /** Tela de itens do roteiro (itens seguidos ficam juntos na mesma tela). */
  items?: ClientServiceUnit[];
  transpose: number;
  settings: OverviewSettings;
  /** Alturas do cabeçalho e do rodapé fixos — a área útil fica entre eles. */
  topInset: number;
  bottomInset: number;
  onFit: (fit: OverviewFit) => void;
  /** +1 = próxima tela, -1 = anterior. */
  onSwipe: (direction: 1 | -1) => void;
};

/**
 * Visão geral do Modo Palco: a música inteira numa tela, sem rolar nem paginar.
 * Testa combinações de colunas × densidade e, em cada uma, acha (busca binária)
 * a maior fonte que cabe; fica com a de maior fonte (empate: menos colunas,
 * densidade normal). Ajustes manuais fixam só a dimensão tocada; o resto segue
 * automático. Se nem a fonte mínima coube, mostra assim mesmo e deixa rolar —
 * nunca corta conteúdo.
 *
 * A medição é no DOM real, antes de pintar (useLayoutEffect). O tamanho de tudo
 * dentro do ColumnViewer é em `em`, então a fonte é escalada direto no wrapper
 * (sem re-renderizar a cada passo da busca); só trocar de colunas re-renderiza.
 */
export default function StageOverview({
  screenKey,
  arrangement,
  items,
  transpose,
  settings,
  topInset,
  bottomInset,
  onFit,
  onSwipe,
}: StageOverviewProps) {
  const areaRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [cfg, setCfg] = useState<{ columns: number; density: OverviewDensity; fontSize: number }>({
    columns: 1,
    density: "normal",
    fontSize: 16,
  });
  const [run, setRun] = useState(0);
  const [scrollable, setScrollable] = useState(false);
  const search = useRef<{ active: boolean; queue: Candidate[]; i: number; best: Best | null }>({
    active: false,
    queue: [],
    i: 0,
    best: null,
  });
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const onFitRef = useRef(onFit);
  onFitRef.current = onFit;

  const songUnits = arrangement?.units ?? [];

  // Tamanho da área útil (entre cabeçalho e rodapé).
  useLayoutEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const update = () =>
      setSize((prev) => (prev.w === el.clientWidth && prev.h === el.clientHeight ? prev : { w: el.clientWidth, h: el.clientHeight }));
    update();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Começa uma busca nova sempre que algo que muda o encaixe muda: tela, tom,
  // ajustes ou tamanho da área (girar o aparelho, por exemplo).
  const searchKey = `${screenKey}|${transpose}|${settings.columns}|${settings.fontSize}|${settings.density}|${size.w}x${size.h}`;
  useLayoutEffect(() => {
    if (size.w === 0 || size.h === 0) return;
    let columnsList: number[];
    let densityList: OverviewDensity[];
    if (items) {
      columnsList = [1];
      densityList = ["normal"];
    } else {
      const maxColumns = Math.max(1, Math.min(4, Math.floor(size.w / MIN_COLUMN_WIDTH), songUnits.length || 1));
      columnsList = settings.columns > 0 ? [Math.min(settings.columns, 4, songUnits.length || 1)] : Array.from({ length: maxColumns }, (_, i) => i + 1);
      densityList = settings.density === "auto" ? ["normal", "compact"] : [settings.density];
    }
    const queue: Candidate[] = [];
    columnsList.forEach((columns) => densityList.forEach((density) => queue.push({ columns, density })));
    search.current = { active: true, queue, i: 0, best: null };
    setCfg((prev) => ({ ...prev, columns: queue[0].columns, density: queue[0].density }));
    setRun((r) => r + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchKey]);

  // Mede o candidato que acabou de ser renderizado e avança pro próximo; no fim, aplica o melhor.
  useLayoutEffect(() => {
    const current = search.current;
    if (!current.active) return;
    const area = areaRef.current;
    const content = contentRef.current;
    const wrapper = content?.firstElementChild as HTMLElement | null | undefined;
    if (!area || !content || !wrapper) return;
    const candidate = current.queue[current.i];
    if (!candidate || cfg.columns !== candidate.columns || cfg.density !== candidate.density) return;

    const fits = () => content.scrollHeight <= area.clientHeight + 1 && content.scrollWidth <= area.clientWidth + 1;
    const manualFont = settingsRef.current.fontSize;
    let fontSize: number | null = null;
    if (manualFont > 0) {
      wrapper.style.fontSize = `${manualFont}px`;
      if (fits()) fontSize = manualFont;
    } else {
      let lo = OVERVIEW_FONT_MIN;
      let hi = FONT_MAX_AUTO;
      while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        wrapper.style.fontSize = `${mid}px`;
        if (fits()) {
          fontSize = mid;
          lo = mid + 1;
        } else {
          hi = mid - 1;
        }
      }
    }
    // Empate de fonte: fica o candidato anterior (menos colunas, densidade normal).
    if (fontSize !== null && (!current.best || fontSize > current.best.fontSize)) {
      current.best = { ...candidate, fontSize };
    }

    if (current.i + 1 < current.queue.length) {
      current.i += 1;
      const next = current.queue[current.i];
      setCfg((prev) => ({ ...prev, columns: next.columns, density: next.density }));
      return;
    }

    // Terminou: aplica o melhor; sem nenhum que caiba, usa o mais denso na fonte mínima (ou a manual) e deixa rolar.
    current.active = false;
    const fallback: Best = {
      ...current.queue[current.queue.length - 1],
      fontSize: manualFont > 0 ? manualFont : OVERVIEW_FONT_MIN,
    };
    const chosen = current.best ?? fallback;
    wrapper.style.fontSize = `${chosen.fontSize}px`;
    setCfg({ columns: chosen.columns, density: chosen.density, fontSize: chosen.fontSize });
    setScrollable(!current.best);
    onFitRef.current({ ...chosen, overflow: !current.best });
  }, [cfg, run]);

  const compact = cfg.density === "compact";
  const wrapperStyle = {
    fontSize: `${cfg.fontSize}px`,
    "--block-gap": compact ? "0.5em" : "1em",
    "--block-px": compact ? "0.5em" : "1em",
    "--block-pt": compact ? "0.25em" : "0.5em",
    "--item-mb": compact ? "0.375em" : "0.5em",
  } as React.CSSProperties;

  // Deslizar na vertical troca de tela (desligado quando a tela está rolando de fato).
  function handleTouchEnd(e: React.TouchEvent) {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || scrollable) return;
    const touch = e.changedTouches[0];
    const dy = touch.clientY - start.y;
    const dx = touch.clientX - start.x;
    if (Math.abs(dy) < SWIPE_MIN_PX || Math.abs(dy) < Math.abs(dx) * 1.5) return;
    // Deslizar para baixo avança; para cima volta.
    onSwipe(dy > 0 ? 1 : -1);
  }

  return (
    <div
      ref={areaRef}
      className={`absolute inset-x-0 ${scrollable ? "overflow-y-auto" : "overflow-hidden"}`}
      style={{ top: topInset, bottom: bottomInset }}
      onTouchStart={(e) => {
        touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }}
      onTouchEnd={handleTouchEnd}
    >
      <div ref={contentRef} className="px-4 py-3 sm:px-6">
        {items ? (
          <div style={wrapperStyle}>
            {items.map((unit) => (
              <StageRoteiroItem key={unit.clientId} unit={unit} />
            ))}
          </div>
        ) : arrangement ? (
          <div style={wrapperStyle}>
            <ColumnViewer
              key={cfg.columns}
              columns={cfg.columns}
              songUnits={songUnits}
              transpose={transpose}
              originalKey={arrangement.key}
              enharmonicPreference={null}
              mode="chords"
              density={cfg.density}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
