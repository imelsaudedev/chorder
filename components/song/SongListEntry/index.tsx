"use client";

import { useUpdateSong } from "#api-client";
import AudioReferenceButton from "@/components/common/AudioReferenceButton";
import HighlightKeyword from "@/components/common/HighlightKeyword";
import YoutubeReferenceButton from "@/components/common/YoutubeReferenceButton";
import SongMetaModal, { SongMetaSavePayload } from "@/components/song/SongMetaModal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Tag from "@/components/common/Tag";
import Text from "@/components/common/Text";
import { ClientArrangement, ClientSong } from "@/prisma/models";
import { MoreVertical, NotebookPen, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSWRConfig } from "swr";

const BTN_SM = "h-7 w-7";

function isSectionMarker(line: string): boolean {
  if (line.startsWith("{")) return true;
  if (line.length < 40 && /^[^\n]{1,30}:$/.test(line)) return true;
  return false;
}

function getVerse1Lines(lyrics: string): string[] {
  const result: string[] = [];
  let started = false;
  for (const raw of lyrics.split("\n")) {
    const line = raw.trim();
    if (isSectionMarker(line)) {
      if (started) break;
      continue;
    }
    if (!line) {
      if (started) break;
      continue;
    }
    started = true;
    result.push(line);
  }
  return result;
}

function getArrangementLabel(
  arr: ClientArrangement,
  index: number,
  total: number
): string {
  if (arr.name?.trim()) return arr.name.trim();
  if (total === 1) return "Arranjo principal";
  return `Arranjo ${index + 1}`;
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
  const arrangements = (song.arrangements ?? []).filter(
    (a) => !a.isServiceArrangement && !a.isDeleted
  );

  const defaultIdx = Math.max(0, arrangements.findIndex((a) => a.isDefault));
  const [selectedIdx, setSelectedIdx] = useState(String(defaultIdx));
  const [metaOpen, setMetaOpen] = useState(false);

  const { updateSong } = useUpdateSong(song.slug);
  const { mutate } = useSWRConfig();
  const router = useRouter();

  function handleMetaSave(payload: SongMetaSavePayload) {
    updateSong({ title: payload.title, artist: payload.artist ?? null, tagIds: payload.tagIds })
      .then(() => mutate((key) => Array.isArray(key) && key[0] === "/api/songs"));
  }

  const selectedArr = arrangements[Number(selectedIdx)] ?? arrangements[0];
  const playTitle = selectedArr?.name?.trim()
    ? `${song.title} — ${selectedArr.name.trim()}`
    : song.title;

  const verse1Lines = getVerse1Lines(song.lyrics);

  const hasAnyMedia = arrangements.some((a) => a.youtubeUrl || (a.audios?.length ?? 0) > 0);

  const arrangementDropdown =
    arrangements.length > 1 && hasAnyMedia ? (
      <Select value={selectedIdx} onValueChange={setSelectedIdx}>
        <SelectTrigger size="compact" className="w-full border-zinc-200">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          {arrangements.map((arr, i) => (
            <SelectItem key={i} value={String(i)} className="text-xs">
              {getArrangementLabel(arr, i, arrangements.length)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    ) : null;

  return (
    <>
    {/* Mobile: 2 cols [title | icons]
        Tablet: 3 cols [title | lyrics | (dropdown+icons)]
        Desktop: 4 cols [title | lyrics | dropdown | icons]
        display:none removes children from grid flow, enabling correct column count per breakpoint */}
    <div className="relative grid grid-cols-[1fr_auto] md:grid-cols-[2fr_3fr_12rem] lg:grid-cols-[2fr_3fr_1.5fr_8rem_6rem] items-start gap-x-2 py-2.5 px-2 -mx-2 rounded-md hover:bg-zinc-50 transition-colors group">

      {/* Overlay: navega em modo lista, seleciona em modo picker */}
      {onSelected ? (
        <button
          type="button"
          className="absolute inset-0 z-0 w-full"
          aria-label={song.title}
          onClick={() => onSelected(song)}
        />
      ) : (
        <Link href={`/songs/${song.slug}`} className="absolute inset-0 z-0" aria-label={song.title} />
      )}

      {/* Col 1 — título, artista e tags */}
      <div className="relative z-10 min-w-0 pointer-events-none">
        <div className="flex items-center gap-1.5 min-w-0">
          <p className="font-display font-semibold text-base lg:text-lg tracking-tight leading-snug lg:leading-tight text-primary truncate">
            <HighlightKeyword text={song.title} keyword={query} />
          </p>
          {arrangements.length > 1 && (
            <span className="shrink-0 text-[10px] font-medium text-zinc-400 bg-zinc-100 rounded px-1 leading-5">
              {arrangements.length}
            </span>
          )}
        </div>
        {song.artist && (
          <Text variant="caption" as="p" className="text-xs md:text-sm truncate mt-0.5">
            <HighlightKeyword text={song.artist} keyword={query} />
          </Text>
        )}
      </div>

      {/* Col 2 — primeiras linhas da letra (oculto no mobile) */}
      <div className="hidden md:block min-w-0">
        {verse1Lines.slice(0, 2).map((line, i) => (
          <Text key={i} variant="caption" as="p" className="text-xs md:text-sm truncate leading-relaxed">
            <HighlightKeyword text={line} keyword={query} />
          </Text>
        ))}
      </div>

      {/* Col 3 — tags (apenas desktop) */}
      <div className="hidden lg:block min-w-0">
        {song.tags && song.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {song.tags.map((tag) => (
              <Tag key={tag.id} label={tag.name} color={tag.group.color} />
            ))}
          </div>
        )}
      </div>

      {/* Col 4 — seletor de arranjo standalone (apenas desktop) */}
      <div className="hidden lg:block relative z-10">
        {arrangementDropdown}
      </div>

      {/* Col 4 — ícones de mídia + ação (sempre visível) */}
      {/* No tablet, inclui o seletor de arranjo inline antes dos ícones */}
      <div className="relative z-10 flex items-center justify-end gap-1">
        {arrangements.length > 1 && (
          <div className="hidden md:flex lg:hidden flex-1 min-w-0 mr-1">
            {arrangementDropdown}
          </div>
        )}
        {selectedArr?.youtubeUrl && (
          <YoutubeReferenceButton
            youtubeUrl={selectedArr.youtubeUrl}
            title={playTitle}
            className={BTN_SM}
          />
        )}
        {(selectedArr?.audios?.length ?? 0) > 0 && (
          <AudioReferenceButton
            audios={selectedArr!.audios!}
            title={playTitle}
            className={BTN_SM}
          />
        )}
        {onSelected ? (
          <Plus className="w-3.5 h-3.5 text-zinc-400 shrink-0 pointer-events-none" />
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={BTN_SM}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setMetaOpen(true)}>
                <Pencil size={14} className="mr-2" />
                Editar dados
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => router.push(`/songs/${song.slug}/edit`)}>
                <NotebookPen size={14} className="mr-2" />
                Editar arranjo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
    <SongMetaModal
      open={metaOpen}
      onOpenChange={setMetaOpen}
      isNew={false}
      defaultValues={{ title: song.title, artist: song.artist ?? "" }}
      onSave={handleMetaSave}
    />
    </>
  );
}
