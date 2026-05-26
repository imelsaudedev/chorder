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

// Colunas: [título+artista] [letra] [arranjos] [mídia] [menu]
// Mobile: 4 cols (letra oculta) | sm+: 5 cols
const ROW_GRID =
  "grid grid-cols-[minmax(0,1fr)_auto_auto_auto] sm:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_6rem_auto_auto] items-center gap-x-4";

const BTN_SM = "h-7 w-7";

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

  const lyricsLines = song.lyrics
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // Na busca, se o match foi na letra e não no título/artista, mostra a linha com match
  let previewLines = lyricsLines.slice(0, 2);
  if (
    query &&
    findKeyword(song.title, query) < 0 &&
    (!song.artist || findKeyword(song.artist, query) < 0)
  ) {
    const matchLine = lyricsLines.find((l) => findKeyword(l, query) >= 0);
    if (matchLine) previewLines = [lyricsLines[0], matchLine].filter(Boolean);
  }

  return (
    <Collapsible>
      {/* Linha principal */}
      <div
        className={`${ROW_GRID} py-2.5 border-b border-zinc-100 hover:bg-zinc-50/60 transition-colors`}
      >
        {/* Col 1: Título + Artista — navega para a música */}
        <Link href={`/songs/${song.slug}`} className="min-w-0 block">
          <p className="font-medium text-sm text-primary leading-snug truncate">
            <HighlightKeyword text={song.title} keyword={query} />
          </p>
          {song.artist && (
            <p className="text-xs text-zinc-500 truncate mt-0.5">
              <HighlightKeyword text={song.artist} keyword={query} />
            </p>
          )}
        </Link>

        {/* Col 2: Letra (oculta no mobile) */}
        <div className="hidden sm:block min-w-0">
          {previewLines.map((line, i) => (
            <p key={i} className="text-xs text-zinc-400 truncate leading-relaxed">
              <HighlightKeyword text={line} keyword={query} />
            </p>
          ))}
        </div>

        {/* Col 3: Número de arranjos — só quando há mais de 1 */}
        <div className="flex items-center">
          {hasMultiple && (
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-6 rounded-full px-2.5 text-xs gap-1 text-zinc-500 border-zinc-300 hover:border-zinc-400"
              >
                {arrangements.length} arr.
                <ChevronDown className="w-3 h-3" />
              </Button>
            </CollapsibleTrigger>
          )}
        </div>

        {/* Col 4: Mídia do arranjo padrão (só quando 1 arranjo) */}
        <div className="flex items-center gap-0.5">
          {!hasMultiple && defaultArr?.youtubeUrl && (
            <YoutubeReferenceButton
              youtubeUrl={defaultArr.youtubeUrl}
              title={song.title}
              className={BTN_SM}
            />
          )}
          {!hasMultiple && defaultArr?.audioUrl && (
            <AudioReferenceButton
              audioUrl={defaultArr.audioUrl}
              title={song.title}
              className={BTN_SM}
            />
          )}
        </div>

        {/* Col 5: Ação principal */}
        <div>
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

      {/* Linhas de arranjos expandidas */}
      {hasMultiple && (
        <CollapsibleContent>
          <div className="border-b border-zinc-100 bg-zinc-50/60">
            {arrangements.map((arr, idx) => (
              <div
                key={arr.id ?? idx}
                className="flex items-center gap-3 py-1.5 pl-6 pr-3 border-t border-zinc-100 first:border-t-0"
              >
                <span className="text-xs text-zinc-600 flex-1 min-w-0 truncate">
                  {arr.name ?? `Arranjo ${idx + 1}`}
                </span>
                <div className="flex items-center gap-0.5 shrink-0">
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
          <AlertDialogTitle>Arquivar &ldquo;{songTitle}&rdquo;?</AlertDialogTitle>
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
