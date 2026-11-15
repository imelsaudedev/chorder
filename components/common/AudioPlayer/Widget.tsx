"use client";

import MediaPlayerBar from "@/components/common/MediaPlayerBar";
import { Music } from "lucide-react";
import { useRef, useState } from "react";
import { useAudioPlayer } from "./context";

export default function AudioPlayerWidget() {
  const { audios, currentIndex, isOpen, close, switchTo } = useAudioPlayer();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);

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
    <>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio
        key={current.url}
        ref={audioRef}
        src={current.url}
        autoPlay
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => {
          if (hasMultiple && currentIndex < audios.length - 1) handleNext();
        }}
        className="hidden"
      />
      <MediaPlayerBar
        icon={<Music size={13} className="text-emerald-400 shrink-0" />}
        title={current.label}
        subtitle={hasMultiple ? `${currentIndex + 1}/${audios.length}` : undefined}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        muted={muted}
        onPlayPause={() => {
          const el = audioRef.current;
          if (!el) return;
          if (el.paused) el.play(); else el.pause();
        }}
        onSeek={(time) => {
          if (audioRef.current) audioRef.current.currentTime = time;
          setCurrentTime(time);
        }}
        onVolumeChange={(value) => {
          setVolume(value);
          if (audioRef.current) audioRef.current.volume = value;
          if (value > 0) setMuted(false);
        }}
        onToggleMute={() => {
          const next = !muted;
          setMuted(next);
          if (audioRef.current) audioRef.current.muted = next;
        }}
        onClose={close}
        onPrev={hasMultiple ? handlePrev : undefined}
        onNext={hasMultiple ? handleNext : undefined}
        tracks={hasMultiple ? audios : undefined}
        currentTrackIndex={currentIndex}
        onSelectTrack={switchTo}
      />
    </>
  );
}
