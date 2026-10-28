"use client";

import { useAudioPlayer } from "@/components/common/AudioPlayer/context";
import { useYoutubePlayer } from "@/components/common/YoutubePlayer/context";

// A barra de player (MediaPlayerBar) é global (montada no layout raiz) e
// cobre o rodapé da tela inteira, não só da liturgia — qualquer elemento
// fixo no rodapé (botão flutuante, navegação mobile) precisa saber se ela
// está aberta pra subir e não ficar escondido atrás dela.
export function useMediaBarOpen(): boolean {
  const { isOpen: isAudioOpen } = useAudioPlayer();
  const { isOpen: isYoutubeOpen } = useYoutubePlayer();
  return isAudioOpen || isYoutubeOpen;
}
