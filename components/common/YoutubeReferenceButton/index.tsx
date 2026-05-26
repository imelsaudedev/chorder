"use client";

import { useAudioPlayer } from "@/components/common/AudioPlayer/context";
import { useYoutubePlayer } from "@/components/common/YoutubePlayer/context";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";

type YoutubeReferenceButtonProps = {
  youtubeUrl: string;
  title?: string;
};

export default function YoutubeReferenceButton({
  youtubeUrl,
  title,
}: YoutubeReferenceButtonProps) {
  const { play } = useYoutubePlayer();
  const { close: closeAudio } = useAudioPlayer();

  return (
    <Button type="button" variant="outline" size="icon" onClick={() => { closeAudio(); play(youtubeUrl, title); }}>
      <PlayCircle className="text-red-500" />
      <span className="sr-only">Reproduzir referência</span>
    </Button>
  );
}
