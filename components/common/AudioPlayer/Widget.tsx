"use client";

import { ChevronDown, Music, Pause, Play, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAudioPlayer } from "./context";

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AudioPlayerWidget() {
  const { audios, currentIndex, title, isOpen, close, switchTo } = useAudioPlayer();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const current = audios[currentIndex];

  useEffect(() => {
    if (isOpen && current && audioRef.current) {
      audioRef.current.load();
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
    if (!isOpen) {
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setExpanded(false);
    }
  }, [isOpen, current]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Number(e.target.value);
    setCurrentTime(Number(e.target.value));
  }

  function handleSwitch(index: number) {
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    switchTo(index);
  }

  if (!isOpen || !current) return null;

  const hasMultiple = audios.length > 1;
  const currentLabel = current.label;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-zinc-900 border-t border-zinc-700">
      <audio
        ref={audioRef}
        src={current.url}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Accordion — outros áudios */}
      {expanded && hasMultiple && (
        <div className="flex flex-wrap gap-2 px-4 py-2 border-b border-zinc-700">
          {audios.map((audio, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSwitch(idx)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                idx === currentIndex
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : "border-zinc-600 text-zinc-300 hover:border-zinc-400 hover:text-white"
              }`}
            >
              {audio.label}
            </button>
          ))}
        </div>
      )}

      {/* Barra principal */}
      <div className="px-4 py-2 md:h-14 md:flex md:items-center md:gap-3 md:py-0">

        {/* Mobile: título + fechar */}
        <div className="flex items-center gap-2 mb-2 md:hidden">
          <Music size={14} className="text-emerald-400 shrink-0" />
          <span className="text-white text-xs font-medium truncate flex-1">
            {title ? `${title} · ${currentLabel}` : currentLabel}
          </span>
          <button type="button" onClick={close} className="text-zinc-400 hover:text-white transition-colors shrink-0">
            <X size={16} />
          </button>
        </div>

        {/* Desktop: título fixo */}
        <div className="hidden md:flex items-center gap-2 w-52 shrink-0">
          <Music size={14} className="text-emerald-400 shrink-0" />
          <div className="flex flex-col min-w-0">
            {title && <span className="text-zinc-400 text-[10px] truncate leading-tight">{title}</span>}
            <span className="text-white text-xs font-medium truncate leading-tight">{currentLabel}</span>
          </div>
        </div>

        {/* Controles */}
        <div className="flex items-center gap-3 flex-1">
          <button type="button" onClick={togglePlay} className="text-white hover:text-emerald-400 transition-colors shrink-0">
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>

          <span className="text-zinc-400 text-xs tabular-nums shrink-0">{formatTime(currentTime)}</span>

          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1 accent-emerald-400 cursor-pointer"
          />

          <span className="text-zinc-400 text-xs tabular-nums shrink-0">{formatTime(duration)}</span>
        </div>

        {/* Expand + fechar (desktop) / só expand (mobile quando há múltiplos) */}
        <div className="hidden md:flex items-center gap-1 shrink-0 ml-2">
          {hasMultiple && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="text-zinc-400 hover:text-white transition-colors p-1"
              title="Mais áudios"
            >
              <ChevronDown size={16} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
            </button>
          )}
          <button type="button" onClick={close} className="text-zinc-400 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Mobile: expand quando há múltiplos */}
        {hasMultiple && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="md:hidden flex items-center gap-1 text-zinc-400 hover:text-white text-xs mb-2 transition-colors"
          >
            <ChevronDown size={14} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
            {audios.length - 1} {audios.length - 1 === 1 ? "outro" : "outros"}
          </button>
        )}
      </div>
    </div>
  );
}
