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

  // React só é dono desta div (wrapperRef); o alvo de verdade da API do
  // YouTube é um <div> criado na mão dentro dela. A API substitui esse alvo
  // por um iframe por fora do React — se o React tentasse remover o próprio
  // nó que deu pra API, a troca já teria acontecido por baixo dos panos e
  // ele quebraria com "Failed to execute 'removeChild'". Com a div extra,
  // o React nunca manipula o nó trocado: só remove o wrapper (que continua
  // sendo filho de verdade), e o que estiver dentro vai junto.
  const wrapperRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YT.Player | null>(null);
  const [ready, setReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (!videoId || !wrapperRef.current) return;
    let cancelled = false;
    const target = document.createElement("div");
    wrapperRef.current.appendChild(target);

    setReady(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    loadYoutubeIframeApi().then(() => {
      if (cancelled || !window.YT) return;
      playerRef.current = new window.YT.Player(target, {
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
      target.remove();
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

  // Pausa (sem destruir) quando o áudio assume, e retoma ao reabrir o mesmo
  // vídeo — ver comentário abaixo sobre por que a div/o player continuam
  // montados mesmo com isOpen false. No primeiro play de um vídeo novo,
  // playVideo() aqui só repete o que playerVars.autoplay já faz (inofensivo).
  useEffect(() => {
    if (isOpen) playerRef.current?.playVideo();
    else playerRef.current?.pauseVideo();
  }, [isOpen]);

  if (!videoId) return null;

  return (
    <>
      {/* Sempre montada enquanto houver um videoId — nunca condicionada a
          isOpen. Se ela desmontasse ao fechar (trocar pra áudio), o efeito
          acima não rodaria de novo (só depende de videoId), e o player da
          API ficaria "vivo" apontando pra um iframe já removido: o play
          pararia de responder ao reabrir o mesmo vídeo. */}
      <div ref={wrapperRef} className="fixed -left-full -top-full" aria-hidden="true" />
      {isOpen && (
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
      )}
    </>
  );
}
