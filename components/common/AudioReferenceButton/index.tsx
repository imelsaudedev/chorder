"use client";

import { AudioItem, useAudioPlayer } from "@/components/common/AudioPlayer/context";
import { useYoutubePlayer } from "@/components/common/YoutubePlayer/context";
import { Button } from "@/components/ui/button";
import { Music } from "lucide-react";

type AudioReferenceButtonProps = {
  audios: AudioItem[];
  title?: string;
  className?: string;
};

export default function AudioReferenceButton({
  audios,
  title,
  className,
}: AudioReferenceButtonProps) {
  const { play } = useAudioPlayer();
  const { close: closeYoutube } = useYoutubePlayer();

  if (!audios.length) return null;

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={className}
      onClick={() => { closeYoutube(); play(audios, title); }}
    >
      <Music className="text-emerald-600" />
      <span className="sr-only">Reproduzir referência de áudio</span>
    </Button>
  );
}
