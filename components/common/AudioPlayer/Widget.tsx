"use client";

import { Music, Pause, Play, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAudioPlayer } from "./context";

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AudioPlayerWidget() {
  const { url, title, isOpen, close } = useAudioPlayer();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (isOpen && url && audioRef.current) {
      audioRef.current.load();
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
    if (!isOpen) {
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [isOpen, url]);

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

  if (!isOpen || !url) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-zinc-900 border-t border-zinc-700 px-4 py-2 md:h-14 md:flex md:items-center md:gap-3 md:py-0">
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Mobile: título + fechar numa linha */}
      <div className="flex items-center gap-2 mb-2 md:hidden">
        <Music size={14} className="text-emerald-400 shrink-0" />
        <span className="text-white text-xs font-medium truncate flex-1">
          {title ?? "Referência de áudio"}
        </span>
        <button
          type="button"
          onClick={close}
          className="text-zinc-400 hover:text-white transition-colors shrink-0"
        >
          <X size={16} />
        </button>
      </div>

      {/* Desktop: título fixo */}
      <div className="hidden md:flex items-center gap-2 w-48 shrink-0">
        <Music size={14} className="text-emerald-400 shrink-0" />
        <span className="text-white text-xs font-medium truncate">
          {title ?? "Referência de áudio"}
        </span>
      </div>

      {/* Controles */}
      <div className="flex items-center gap-3 flex-1">
        <button
          type="button"
          onClick={togglePlay}
          className="text-white hover:text-emerald-400 transition-colors shrink-0"
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>

        <span className="text-zinc-400 text-xs tabular-nums shrink-0">
          {formatTime(currentTime)}
        </span>

        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          className="flex-1 h-1 accent-emerald-400 cursor-pointer"
        />

        <span className="text-zinc-400 text-xs tabular-nums shrink-0">
          {formatTime(duration)}
        </span>
      </div>

      {/* Desktop: fechar */}
      <button
        type="button"
        onClick={close}
        className="hidden md:block text-zinc-400 hover:text-white transition-colors shrink-0 ml-2"
      >
        <X size={16} />
      </button>
    </div>
  );
}
