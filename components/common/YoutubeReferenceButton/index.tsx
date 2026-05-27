"use client";

import { useYoutubePlayer } from "@/components/common/YoutubePlayer/context";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";

type YoutubeReferenceButtonProps = {
  youtubeUrl: string;
  title?: string;
  className?: string;
};

export default function YoutubeReferenceButton({
  youtubeUrl,
  title,
  className,
}: YoutubeReferenceButtonProps) {
  const { play } = useYoutubePlayer();

  return (
    <Button type="button" variant="outline" size="icon" className={className} onClick={() => play(youtubeUrl, title)}>
      <PlayCircle className="text-red-500" />
      <span className="sr-only">Reproduzir referência</span>
    </Button>
  );
}
