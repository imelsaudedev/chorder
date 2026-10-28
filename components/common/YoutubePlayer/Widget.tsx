"use client";

import MediaPlayerBar from "@/components/common/MediaPlayerBar";
import { Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useYoutubePlayer } from "./context";
import { extractYoutubeId } from "./extractYoutubeId";
import { loadYoutubeIframeApi } from "./youtubeIframeApi";
import { useYoutubeTitle } from "./useYoutubeTitle";

// Mesma barra de rodapé do áudio enviado (MediaPlayerBar) — só o áudio do
// vídeo toca, sem mostrar o frame; o player do YouTube fica fora da tela
// (não escondido com display:none, que em alguns navegadores pausa a
// reprodução), controlado pela IFrame API em vez do iframe simples de antes.
export default function YoutubePlayerWidget() {
  const { url, isOpen, close } = useYoutubePlayer();
  const videoId = url ? extractYoutubeId(url) : null;
  const realTitle = useYoutubeTitle(isOpen ? url : null);

  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YT.Player | null>(null);
  const [ready, setReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (!videoId || !containerRef.current) return;
    let cancelled = false;

    setReady(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    loadYoutubeIframeApi().then(() => {
      if (cancelled || !containerRef.current || !window.YT) return;
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        width: "1",
        height: "1",
        playerVars: { autoplay: 1, playsinline: 1 },
        events: {
          onReady: (event) => {
            setReady(true);
            setVolume(event.target.getVolume() / 100);
          },
          onStateChange: (event) => {
            setIsPlaying(event.data === YT.PlayerState.PLAYING);
            if (event.data === YT.PlayerState.ENDED) close();
          },
        },
      });
    });

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  // A IFrame API não emite evento de progresso — só dá pra saber a posição perguntando.
  useEffect(() => {
    if (!ready || !isPlaying) return;
    const id = setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      setCurrentTime(player.getCurrentTime());
      setDuration(player.getDuration());
    }, 500);
    return () => clearInterval(id);
  }, [ready, isPlaying]);

  if (!isOpen || !videoId) return null;

  return (
    <>
      <div ref={containerRef} className="fixed -left-full -top-full" aria-hidden="true" />
      <MediaPlayerBar
        icon={<Play size={13} className="text-red-500 shrink-0" />}
        title={realTitle ?? "Vídeo do YouTube"}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        muted={muted}
        onPlayPause={() => {
          const player = playerRef.current;
          if (!player) return;
          if (isPlaying) player.pauseVideo(); else player.playVideo();
        }}
        onSeek={(time) => {
          playerRef.current?.seekTo(time, true);
          setCurrentTime(time);
        }}
        onVolumeChange={(value) => {
          setVolume(value);
          playerRef.current?.setVolume(value * 100);
          if (value > 0) setMuted(false);
        }}
        onToggleMute={() => {
          const player = playerRef.current;
          if (!player) return;
          const next = !muted;
          setMuted(next);
          if (next) player.mute(); else player.unMute();
        }}
        onClose={close}
      />
    </>
  );
}
