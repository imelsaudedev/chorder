"use client";

import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { ChevronUp, Music, Pause, Play, Repeat, SkipBack, SkipForward, Volume2, VolumeX, X } from "lucide-react";
import { useState } from "react";
import { useAudioPlayer } from "./context";

export default function AudioPlayerWidget() {
  const { audios, currentIndex, title, isOpen, close, switchTo } = useAudioPlayer();
  const [listVisible, setListVisible] = useState(true);

  const current = audios[currentIndex];
  const hasMultiple = audios.length > 1;

  if (!isOpen || !current) return null;

  function handlePrev() {
    if (currentIndex > 0) switchTo(currentIndex - 1);
  }

  function handleNext() {
    if (currentIndex < audios.length - 1) switchTo(currentIndex + 1);
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] audio-player-dark">
      {/* Seletor de faixas */}
      {hasMultiple && listVisible && (
        <div className="flex flex-wrap gap-2 px-4 py-2 bg-zinc-800 border-t border-zinc-700">
          {audios.map((audio, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => switchTo(idx)}
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

      <AudioPlayer
        key={current.url}
        src={current.url}
        autoPlay
        showSkipControls={hasMultiple}
        showJumpControls={false}
        onClickPrevious={handlePrev}
        onClickNext={handleNext}
        onEnded={hasMultiple && currentIndex < audios.length - 1 ? handleNext : undefined}
        customIcons={{
          play: <Play size={20} />,
          pause: <Pause size={20} />,
          previous: <SkipBack size={16} />,
          next: <SkipForward size={16} />,
          volume: <Volume2 size={16} />,
          volumeMute: <VolumeX size={16} />,
          loop: <Repeat size={14} />,
          loopOff: <Repeat size={14} className="opacity-30" />,
        }}
        layout="horizontal"
        header={
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 min-w-0">
              {hasMultiple && (
                <button
                  type="button"
                  onClick={() => setListVisible((v) => !v)}
                  className="text-zinc-500 hover:text-white transition-colors shrink-0"
                  title={listVisible ? "Ocultar lista" : "Exibir lista"}
                >
                  <ChevronUp
                    size={15}
                    className={`transition-transform ${listVisible ? "" : "rotate-180"}`}
                  />
                </button>
              )}
              <Music size={13} className="text-emerald-400 shrink-0" />
              <span className="text-xs text-zinc-300 truncate">
                {current.label}
                {hasMultiple && (
                  <span className="text-zinc-500 ml-1">
                    ({currentIndex + 1}/{audios.length})
                  </span>
                )}
              </span>
            </div>
            <button
              type="button"
              onClick={close}
              className="text-zinc-500 hover:text-white transition-colors shrink-0 ml-3"
            >
              <X size={16} />
            </button>
          </div>
        }
      />
    </div>
  );
}
