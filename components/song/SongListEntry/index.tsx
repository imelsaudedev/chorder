"use client";

import { useArchiveSong } from "#api-client";
import AudioReferenceButton from "@/components/common/AudioReferenceButton";
import HighlightKeyword, {
  findKeyword,
} from "@/components/common/HighlightKeyword";
import YoutubeReferenceButton from "@/components/common/YoutubeReferenceButton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClientSong } from "@/prisma/models";
import { Music, MoreHorizontal, PlayCircle, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useSWRConfig } from "swr";

const BTN_SM = "h-7 w-7";

// Linhas que são marcadores de seção no formato ChoPro/texto puro — não são letra
function isSectionMarker(line: string): boolean {
  if (line.startsWith("{")) return true;
  // Linhas curtas terminando em ":" — ex: "Intro:", "Refrão:", "Verso 1:"
  if (line.length < 40 && /^[^\n]{1,30}:$/.test(line)) return true;
  return false;
}

function getLyricsPreview(lyrics: string, query: string): string[] {
  const lines = lyrics
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !isSectionMarker(l));

  if (!query) return lines.slice(0, 2);

  const firstLine = lines[0] ?? "";
  const matchLine = lines.find((l) => findKeyword(l, query) >= 0);
  if (matchLine && matchLine !== firstLine) return [firstLine, matchLine];
  return lines.slice(0, 2);
}

type SongListEntryProps = {
  song: ClientSong;
  query?: string;
  onSelected?: (song: ClientSong) => void;
};

export default function SongListEntry({
  song,
  query = "",
  onSelected,
}: SongListEntryProps) {
  const [isOpen, setIsOpen] = useState(false);

  const arrangements = (song.arrangements ?? []).filter(
    (a) => !a.isServiceArrangement && !a.isDeleted
  );

  const hasYoutube = arrangements.some((a) => a.youtubeUrl);
  const hasAudio = arrangements.some((a) => a.audioUrl);

  const lyricsPreview = getLyricsPreview(song.lyrics, query);

  function handleRowClick() {
    setIsOpen((v) => !v);
  }

  return (
    <div className="border-b border-zinc-100 last:border-b-0">
      {/* Cabeçalho — clicável para expandir */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleRowClick}
        onKeyDown={(e) => e.key === "Enter" && handleRowClick()}
        className="flex items-center gap-3 py-3 px-1 hover:bg-zinc-50 transition-colors cursor-pointer rounded-sm"
      >
        {/* Título + Artista — link de navegação (não expande) */}
        <div className="flex-1 min-w-0">
          <Link
            href={`/songs/${song.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="block"
          >
            <p className="font-medium text-sm text-primary leading-snug truncate">
              <HighlightKeyword text={song.title} keyword={query} />
            </p>
          </Link>
          {song.artist && (
            <p className="text-xs text-zinc-500 truncate mt-0.5">
              <HighlightKeyword text={song.artist} keyword={query} />
            </p>
          )}
        </div>

        {/* Indicadores de mídia — informativos, não clicáveis */}
        <div
          className="flex items-center gap-1.5 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {hasYoutube && (
            <PlayCircle
              className="w-3.5 h-3.5 text-red-400"
              aria-label="Tem referência YouTube"
            />
          )}
          {hasAudio && (
            <Music
              className="w-3.5 h-3.5 text-emerald-500"
              aria-label="Tem referência de áudio"
            />
          )}
        </div>

        {/* Ação principal */}
        <div
          className="shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {onSelected ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-400 hover:text-primary"
              onClick={() => onSelected(song)}
            >
              <Plus className="w-4 h-4" />
              <span className="sr-only">Adicionar ao service</span>
            </Button>
          ) : (
            <SongActionsMenu songSlug={song.slug} songTitle={song.title} />
          )}
        </div>
      </div>

      {/* Corpo expandido */}
      {isOpen && (
        <div className="px-1 pb-3">
          {/* Prévia da letra */}
          {lyricsPreview.length > 0 && (
            <div className="border-t border-dashed border-zinc-200 pt-2.5 pb-3">
              {lyricsPreview.map((line, i) => (
                <p key={i} className="text-xs text-zinc-400 leading-relaxed">
                  <HighlightKeyword text={line} keyword={query} />
                </p>
              ))}
            </div>
          )}

          {/* Arranjos com botões de mídia */}
          {arrangements.length > 0 && (
            <div className="space-y-0.5">
              {arrangements.map((arr, idx) => (
                <div
                  key={arr.id ?? idx}
                  className="flex items-center gap-3 py-1.5 pl-2 pr-0 rounded"
                >
                  <span className="text-xs text-zinc-500 flex-1 min-w-0 truncate">
                    {arr.name ?? `Arranjo ${idx + 1}`}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    {arr.youtubeUrl && (
                      <YoutubeReferenceButton
                        youtubeUrl={arr.youtubeUrl}
                        title={
                          arr.name
                            ? `${song.title} — ${arr.name}`
                            : song.title
                        }
                        className={BTN_SM}
                      />
                    )}
                    {arr.audioUrl && (
                      <AudioReferenceButton
                        audioUrl={arr.audioUrl}
                        title={
                          arr.name
                            ? `${song.title} — ${arr.name}`
                            : song.title
                        }
                        className={BTN_SM}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SongActionsMenu({
  songSlug,
  songTitle,
}: {
  songSlug: string;
  songTitle: string;
}) {
  const { archiveSong } = useArchiveSong(songSlug);
  const { mutate } = useSWRConfig();

  async function handleArchive() {
    await archiveSong();
    mutate((key) => Array.isArray(key) && key[0] === "/api/songs");
  }

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-zinc-400 hover:text-zinc-700"
          >
            <MoreHorizontal className="w-4 h-4" />
            <span className="sr-only">Ações</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/songs/${songSlug}`}>Renomear</Link>
          </DropdownMenuItem>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onSelect={(e) => e.preventDefault()}
            >
              Arquivar
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Arquivar &ldquo;{songTitle}&rdquo;?
          </AlertDialogTitle>
          <AlertDialogDescription>
            A música será removida da lista. Arranjos em services existentes não
            são afetados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700"
            onClick={handleArchive}
          >
            Arquivar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
