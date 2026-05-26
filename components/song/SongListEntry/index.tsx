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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClientSong } from "@/prisma/models";
import { ChevronDown, MoreHorizontal, Plus } from "lucide-react";
import Link from "next/link";
import { useSWRConfig } from "swr";

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
  const arrangements = (song.arrangements ?? []).filter(
    (a) => !a.isServiceArrangement && !a.isDeleted
  );
  const defaultArr =
    arrangements.find((a) => a.isDefault) ?? arrangements[0];
  const hasMultiple = arrangements.length > 1;

  const lyrics = song.lyrics
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  let previewLine = lyrics[0] ?? "";
  if (
    query &&
    findKeyword(song.title, query) < 0 &&
    (!song.artist || findKeyword(song.artist, query) < 0)
  ) {
    const matchLine = lyrics.find((l) => findKeyword(l, query) >= 0);
    if (matchLine) previewLine = matchLine;
  }

  return (
    <Collapsible>
      <div className="flex items-start gap-2 border-b border-zinc-100 py-3 hover:bg-zinc-50 transition-colors rounded-sm">
        {/* Zona de conteúdo — navega para a música */}
        <Link
          href={`/songs/${song.slug}`}
          className="flex-1 min-w-0 pr-1 block"
        >
          <p className="font-medium text-sm text-primary leading-snug truncate">
            <HighlightKeyword text={song.title} keyword={query} />
          </p>
          {song.artist && (
            <p className="text-xs text-zinc-500 truncate mt-0.5">
              <HighlightKeyword text={song.artist} keyword={query} />
            </p>
          )}
          {/* Slot para badges de tema — renderiza vazio até temas serem adicionados */}
          {previewLine && (
            <p className="text-xs text-zinc-400 mt-1 truncate">
              <HighlightKeyword text={previewLine} keyword={query} />
            </p>
          )}
        </Link>

        {/* Zona de ações — não navega */}
        <div className="shrink-0 flex items-center gap-0.5">
          {/* Arranjo único: botões de mídia direto */}
          {!hasMultiple && defaultArr?.youtubeUrl && (
            <YoutubeReferenceButton
              youtubeUrl={defaultArr.youtubeUrl}
              title={song.title}
            />
          )}
          {!hasMultiple && defaultArr?.audioUrl && (
            <AudioReferenceButton
              audioUrl={defaultArr.audioUrl}
              title={song.title}
            />
          )}

          {/* Múltiplos arranjos: trigger de expand */}
          {hasMultiple && (
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs text-zinc-500 gap-1 hover:text-zinc-700"
              >
                {arrangements.length} arr.
                <ChevronDown className="w-3 h-3" />
              </Button>
            </CollapsibleTrigger>
          )}

          {/* Ação principal: adicionar ao service ou menu de ações */}
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

      {/* Arranjos expandidos */}
      {hasMultiple && (
        <CollapsibleContent>
          <div className="border-b border-zinc-100 bg-zinc-50/60 px-3 py-1 space-y-0.5">
            {arrangements.map((arr, idx) => (
              <div
                key={arr.id ?? idx}
                className="flex items-center gap-2 py-1.5"
              >
                <span className="text-xs text-zinc-600 flex-1 min-w-0 truncate">
                  {arr.name ?? `Arranjo ${idx + 1}`}
                </span>
                <div className="flex items-center gap-0.5 shrink-0">
                  {arr.youtubeUrl && (
                    <YoutubeReferenceButton
                      youtubeUrl={arr.youtubeUrl}
                      title={arr.name ? `${song.title} — ${arr.name}` : song.title}
                    />
                  )}
                  {arr.audioUrl && (
                    <AudioReferenceButton
                      audioUrl={arr.audioUrl}
                      title={arr.name ? `${song.title} — ${arr.name}` : song.title}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      )}
    </Collapsible>
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
          <AlertDialogTitle>Arquivar "{songTitle}"?</AlertDialogTitle>
          <AlertDialogDescription>
            A música será removida da lista. Arranjos existentes em services não
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
