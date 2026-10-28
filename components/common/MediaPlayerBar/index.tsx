"use client";

import { ChevronUp, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX, X } from "lucide-react";
import { ReactNode, useState } from "react";

// Barra única de rodapé, compartilhada pelo áudio enviado e pelo vídeo do
// YouTube (só o áudio dele — sem mostrar o frame de vídeo). Cada widget
// (AudioPlayer/Widget.tsx, YoutubePlayer/Widget.tsx) é o "motor" por trás
// (uma tag <audio> nativa ou a API do player do YouTube) e só repassa estado
// e callbacks pra esta barra — o visual fica idêntico nos dois casos.
type Track = { label: string };

type MediaPlayerBarProps = {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  tracks?: Track[];
  currentTrackIndex?: number;
  onSelectTrack?: (index: number) => void;
};

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function MediaPlayerBar({
  icon,
  title,
  subtitle,
  isPlaying,
  currentTime,
  duration,
  volume,
  muted,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onClose,
  onPrev,
  onNext,
  tracks,
  currentTrackIndex,
  onSelectTrack,
}: MediaPlayerBarProps) {
  const [listVisible, setListVisible] = useState(true);
  const hasMultiple = (tracks?.length ?? 0) > 1;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-zinc-900 text-white shadow-2xl">
      {hasMultiple && listVisible && (
        <div className="flex flex-wrap gap-2 px-4 py-2 bg-zinc-800 border-t border-zinc-700">
          {tracks!.map((track, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectTrack?.(idx)}
              className={`cursor-pointer text-xs px-3 py-1 rounded-full border transition-colors ${
                idx === currentTrackIndex
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : "border-zinc-600 text-zinc-300 hover:border-zinc-400 hover:text-white"
              }`}
            >
              {track.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-1 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-2">
            {hasMultiple && (
              <button
                type="button"
                onClick={() => setListVisible((v) => !v)}
                className="cursor-pointer shrink-0 text-zinc-500 hover:text-white transition-colors"
                title={listVisible ? "Ocultar lista" : "Exibir lista"}
              >
                <ChevronUp size={15} className={`transition-transform ${listVisible ? "" : "rotate-180"}`} />
              </button>
            )}
            {icon}
            <span className="min-w-0 truncate text-xs text-zinc-300">
              {title}
              {subtitle && <span className="ml-1 text-zinc-500">({subtitle})</span>}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar player"
            className="cursor-pointer shrink-0 text-zinc-500 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {onPrev && (
            <button
              type="button"
              onClick={onPrev}
              aria-label="Faixa anterior"
              className="cursor-pointer shrink-0 text-zinc-300 hover:text-white transition-colors"
            >
              <SkipBack size={16} />
            </button>
          )}

          <button
            type="button"
            onClick={onPlayPause}
            aria-label={isPlaying ? "Pausar" : "Tocar"}
            className="cursor-pointer shrink-0 flex size-8 items-center justify-center rounded-full bg-emerald-500 text-white hover:bg-emerald-400 transition-colors"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>

          {onNext && (
            <button
              type="button"
              onClick={onNext}
              aria-label="Próxima faixa"
              className="cursor-pointer shrink-0 text-zinc-300 hover:text-white transition-colors"
            >
              <SkipForward size={16} />
            </button>
          )}

          <span className="shrink-0 text-xs tabular-nums text-zinc-400 w-10 text-right">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            aria-label="Posição"
            min={0}
            max={duration || 0}
            step={0.1}
            value={Math.min(currentTime, duration || 0)}
            onChange={(e) => onSeek(Number(e.target.value))}
            className="min-w-0 flex-1 accent-emerald-500 cursor-pointer"
          />
          <span className="shrink-0 text-xs tabular-nums text-zinc-400 w-10">
            {formatTime(duration)}
          </span>

          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? "Ativar som" : "Mudo"}
            className="cursor-pointer hidden sm:block shrink-0 text-zinc-300 hover:text-white transition-colors"
          >
            {muted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input
            type="range"
            aria-label="Volume"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="hidden sm:block w-16 accent-emerald-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
