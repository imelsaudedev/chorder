"use client";

import { AudioItem, useAudioPlayer } from "@/components/common/AudioPlayer/context";
import { useYoutubePlayer } from "@/components/common/YoutubePlayer/context";
import { useYoutubeTitle } from "@/components/common/YoutubePlayer/useYoutubeTitle";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ClientArrangement } from "@/prisma/models";
import { Music, Play } from "lucide-react";
import { useState } from "react";

type ReferenceGroup = {
  arrangementId: number | null;
  label: string;
  video: string | null;
  audios: AudioItem[];
};

type SongReferencesProps = {
  arrangements: ClientArrangement[];
  /** Título mostrado no player (normalmente o da música). */
  title: string;
  className?: string;
};

function arrangementLabel(arr: ClientArrangement, index: number, total: number): string {
  if (arr.name?.trim()) return arr.name.trim();
  return total === 1 ? "Arranjo principal" : `Arranjo ${index + 1}`;
}

/** Referências (vídeo e áudios) de cada arranjo que tem alguma. */
export function buildReferenceGroups(arrangements: ClientArrangement[]): ReferenceGroup[] {
  const usable = arrangements.filter((a) => !a.isServiceArrangement && !a.isDeleted);
  return usable
    .map((arr, i) => ({
      arrangementId: arr.id ?? null,
      label: arrangementLabel(arr, i, usable.length),
      video: arr.youtubeUrl || null,
      audios: (arr.audios ?? []).map(({ url, label }) => ({ url, label })),
    }))
    .filter((g) => g.video || g.audios.length > 0);
}

function VideoItem({ url, onPlay }: { url: string; onPlay: () => void }) {
  // Só existe com o popover aberto: o título real do vídeo é buscado nesse momento.
  const videoTitle = useYoutubeTitle(url);
  return (
    <button type="button" className={itemClass} onClick={onPlay}>
      <Play size={16} className="shrink-0 text-red-500" />
      <span className="truncate">{videoTitle ?? "Vídeo de referência"}</span>
    </button>
  );
}

const itemClass =
  "flex min-h-11 w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm hover:bg-muted/50";

/**
 * Botão de referências da lista de músicas: um só, com os ícones do que existe.
 * Uma única referência toca direto; duas ou mais abrem um popover de leitura,
 * agrupado pelo nome do arranjo quando mais de um arranjo tem mídia.
 */
export default function SongReferences({ arrangements, title, className }: SongReferencesProps) {
  const [open, setOpen] = useState(false);
  const youtube = useYoutubePlayer();
  const audio = useAudioPlayer();

  const groups = buildReferenceGroups(arrangements);
  const total = groups.reduce((n, g) => n + (g.video ? 1 : 0) + g.audios.length, 0);
  if (total === 0) return null;

  const hasVideo = groups.some((g) => g.video);
  const hasAudio = groups.some((g) => g.audios.length > 0);

  const playVideo = (g: ReferenceGroup) => {
    if (!g.video) return;
    audio.close();
    youtube.play(g.video, title, g.arrangementId);
    setOpen(false);
  };
  const playAudio = (g: ReferenceGroup, index: number) => {
    youtube.close();
    audio.play(g.audios, title, index, g.arrangementId);
    setOpen(false);
  };

  // Realça o botão da música que está tocando.
  const ids = groups.map((g) => g.arrangementId).filter((id): id is number => id !== null);
  const isPlaying =
    (youtube.isOpen && youtube.arrangementId !== null && ids.includes(youtube.arrangementId)) ||
    (audio.isOpen && audio.arrangementId !== null && ids.includes(audio.arrangementId));

  const icons = (
    <>
      {hasVideo && <Play size={16} className="text-red-500" />}
      {hasAudio && <Music size={16} className="text-secondary" />}
    </>
  );
  const buttonClass = cn("h-10 w-14 gap-1.5 px-0 hover:bg-muted/40 data-[state=open]:bg-muted/40", isPlaying && "ring-2 ring-secondary ring-offset-1", className);

  if (total === 1) {
    const g = groups[0];
    return (
      <Button
        type="button"
        variant="ghost"
        className={buttonClass}
        aria-label="Ouvir referência"
        onClick={() => (g.video ? playVideo(g) : playAudio(g, 0))}
      >
        {icons}
      </Button>
    );
  }

  const grouped = groups.length > 1;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" className={buttonClass} aria-label="Referências" aria-haspopup="dialog">
          {icons}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" collisionPadding={16} className="w-[340px] max-w-[calc(100vw-2rem)] p-1">
        <div className="flex flex-col gap-0.5">
          {groups.map((g) => (
            <div key={g.arrangementId ?? g.label} className="flex flex-col gap-0.5">
              {grouped && (
                <p className="px-2.5 pt-2.5 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {g.label}
                </p>
              )}
              {g.video && <VideoItem url={g.video} onPlay={() => playVideo(g)} />}
              {g.audios.map((a, i) => (
                <button key={`${a.url}-${i}`} type="button" className={itemClass} onClick={() => playAudio(g, i)}>
                  <Music size={16} className="shrink-0 text-secondary" />
                  <span className="truncate">{a.label}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
