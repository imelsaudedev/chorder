"use client";

import { useAudioPlayer } from "@/components/common/AudioPlayer/context";
import { useYoutubePlayer } from "@/components/common/YoutubePlayer/context";
import { Button } from "@/components/ui/button";
import { Music } from "lucide-react";

type AudioReferenceButtonProps = {
  audioUrl: string;
  title?: string;
};

export default function AudioReferenceButton({
  audioUrl,
  title,
}: AudioReferenceButtonProps) {
  const { play } = useAudioPlayer();
  const { close: closeYoutube } = useYoutubePlayer();

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={() => { closeYoutube(); play(audioUrl, title); }}
    >
      <Music className="text-emerald-600" />
      <span className="sr-only">Reproduzir referência de áudio</span>
    </Button>
  );
}
